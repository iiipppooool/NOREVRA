import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { authConfigured } from "@/lib/auth-config";
import { brand } from "@/data/brand";
import { buildMetadata } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { SignOutButton } from "@/components/account/SignInButtons";
import { ordersFor } from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

/** Personal, and session-dependent: never prerendered or cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Account",
  description: "Your orders.",
  path: "/account",
  noIndex: true,
});

export default async function AccountPage() {
  if (!authConfigured()) redirect("/account/sign-in");
  const session = await auth();
  if (!session?.user) redirect("/account/sign-in?next=/account");

  const result = await ordersFor(session.user.email);
  const recent = result.state === "ok" ? result.orders.slice(0, 2) : [];

  return (
    <>
      <Masthead
        eyebrow="Account"
        title={session.user.name ? `Good to see you, ${session.user.name.split(" ")[0]}` : "Your account"}
        lede="Everything we hold about you is on this page. There is not much of it, which is deliberate."
        meta={<SignOutButton />}
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-14 lg:grid-cols-12">
          <section aria-labelledby="orders-heading" className="lg:col-span-7">
            <div className="flex items-baseline justify-between gap-6 rule-t pt-7">
              <h2 id="orders-heading" className="label-lg text-ink">
                Recent orders
              </h2>
              <Link href="/account/orders" className="link-draw label text-smoke">
                All orders
              </Link>
            </div>

            {result.state === "not_configured" && (
              <p className="mt-7 max-w-[34rem] text-small text-smoke">
                Order history is read back from our payment provider, which is not connected on
                this deployment — so there is nothing to show rather than nothing to find. Email{" "}
                <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
                  {brand.email.general}
                </a>{" "}
                and we will look anything up by hand.
              </p>
            )}

            {result.state === "error" && (
              <p role="alert" className="mt-7 text-small text-clay">
                {result.message}
              </p>
            )}

            {result.state === "ok" && recent.length === 0 && (
              <div className="mt-7">
                <p className="editorial max-w-[30rem] text-smoke">
                  Nothing yet. Orders placed with this email address will appear here.
                </p>
                <div className="mt-8">
                  <ButtonLink href="/furniture" variant="outline">
                    Open the catalogue
                  </ButtonLink>
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <ul className="mt-2">
                {recent.map((o) => (
                  <li key={o.id} className="rule-b py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <p className="label tabular-nums text-mist" data-numeric>
                        {o.reference} · {formatDate(o.placed)}
                      </p>
                      <p className="label-lg tabular-nums text-ink" data-numeric>
                        {formatPrice(o.total)}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {o.lines.map((l, i) => (
                        <li key={i} className="text-small text-smoke">
                          {l.quantity} × {l.description}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="label-lg rule-t pt-7 text-ink">What we hold</h2>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="label text-mist">Name</dt>
                <dd className="mt-1 text-small text-ink">{session.user.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="label text-mist">Email</dt>
                <dd className="mt-1 break-all text-small text-ink">{session.user.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="label text-mist">Stored on our servers</dt>
                <dd className="mt-1 text-small text-smoke">
                  Nothing. Your session is a signed cookie in this browser; your bag and saved
                  pieces never leave it either.
                </dd>
              </div>
            </dl>

            <p className="label mt-8 text-mist">
              <Link href="/legal/privacy" className="link-draw text-smoke">
                Privacy notice
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
