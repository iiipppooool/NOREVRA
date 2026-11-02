import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { authConfigured } from "@/lib/auth-config";
import { brand } from "@/data/brand";
import { buildMetadata } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { ordersFor } from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { ORDERS_REQUIREMENTS } from "@/lib/auth-config";

/** Personal, and session-dependent: never prerendered or cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Orders",
  description: "Everything you have ordered.",
  path: "/account/orders",
  noIndex: true,
});

const STATUS: Record<string, string> = {
  paid: "Confirmed",
  pending: "Awaiting payment",
  cancelled: "Expired",
};

export default async function OrdersPage() {
  if (!authConfigured()) redirect("/account/sign-in");
  const session = await auth();
  if (!session?.user) redirect("/account/sign-in?next=/account/orders");

  const result = await ordersFor(session.user.email);

  return (
    <>
      <Masthead
        eyebrow="Account"
        title="Your orders"
        lede="Read back from our payment provider, so this is the same record we work from."
        trail={[
          { name: "Account", path: "/account" },
          { name: "Orders", path: "/account/orders" },
        ]}
      />

      <div className="gutter pb-[var(--spacing-section)]">
        {result.state === "not_configured" && (
          <div className="max-w-[40rem] rule-t pt-9">
            <p className="editorial text-ink">Order history is not connected on this deployment.</p>
            <p className="mt-4 text-small text-smoke">
              Orders are read back from the payment provider rather than from a database of our
              own, so history appears as soon as payment is connected. Nothing has been lost.
            </p>
            <details className="mt-7">
              <summary className="label cursor-pointer text-mist">Configuration required</summary>
              <ul className="mt-3 space-y-2">
                {ORDERS_REQUIREMENTS.map((r) => (
                  <li key={r} className="text-small text-smoke">
                    {r}
                  </li>
                ))}
              </ul>
            </details>
            <div className="mt-9">
              <ButtonLink href={`mailto:${brand.email.general}`} variant="outline">
                Ask us to look it up
              </ButtonLink>
            </div>
          </div>
        )}

        {result.state === "error" && (
          <p role="alert" className="rule-t pt-9 text-small text-clay">
            {result.message}
          </p>
        )}

        {result.state === "ok" && result.orders.length === 0 && (
          <div className="max-w-[34rem] rule-t pt-9">
            <p className="editorial text-smoke">
              No orders against {session.user.email} yet.
            </p>
            <div className="mt-8">
              <ButtonLink href="/furniture" variant="solid">
                Open the catalogue
              </ButtonLink>
            </div>
          </div>
        )}

        {result.state === "ok" && result.orders.length > 0 && (
          <ul className="rule-t">
            {result.orders.map((o) => (
              <li key={o.id} className="rule-b py-8">
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <p className="label tabular-nums text-ink" data-numeric>
                      {o.reference}
                    </p>
                    <p className="label mt-1.5 text-mist">{formatDate(o.placed)}</p>
                    <p className="label mt-3 text-smoke">{STATUS[o.status] ?? o.status}</p>
                  </div>
                  <div className="lg:col-span-6">
                    <ul className="space-y-2">
                      {o.lines.map((l, i) => (
                        <li key={i} className="flex justify-between gap-6">
                          <span className="text-small text-ink">
                            {l.quantity} × {l.description}
                          </span>
                          <span className="label shrink-0 tabular-nums text-mist" data-numeric>
                            {formatPrice(l.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-2 lg:col-start-11 lg:text-right">
                    <p className="font-display text-heading tabular-nums text-ink" data-numeric>
                      {formatPrice(o.total)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 max-w-[38rem] text-small text-smoke">
          Something not right? Quote the reference and write to{" "}
          <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
            {brand.email.general}
          </a>
          , or call{" "}
          <a href={`tel:${brand.telephone.href}`} className="link-draw text-ink" data-numeric>
            {brand.telephone.display}
          </a>
          .
        </p>
      </div>
    </>
  );
}
