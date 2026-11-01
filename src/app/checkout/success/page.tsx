import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/data/brand";
import { buildMetadata } from "@/lib/seo";
import { stripeConfigured } from "@/lib/integrations";
import { formatPrice } from "@/lib/format";
import { Masthead } from "@/components/ui/Masthead";
import { ButtonLink } from "@/components/ui/Button";
import { ClearBagOnConfirm } from "@/components/bag/ClearBagOnConfirm";

export const metadata: Metadata = buildMetadata({
  title: "Order received",
  description: "Your order has been received.",
  path: "/checkout/success",
  noIndex: true,
});

type Props = { searchParams: Promise<{ session_id?: string }> };

type Confirmed = {
  reference: string;
  amountTotal: number | null;
  currency: string;
  email: string | null;
  paid: boolean;
};

/**
 * The confirmation is read back from the payment provider on the server. If
 * there is no session to verify, or no provider configured, the page says so
 * — it never claims a payment that cannot be evidenced.
 */
async function verify(sessionId: string | undefined): Promise<Confirmed | null> {
  if (!sessionId || !stripeConfigured()) return null;
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      reference: session.id.slice(-12).toUpperCase(),
      amountTotal: session.amount_total,
      currency: (session.currency ?? brand.commerce.currency).toUpperCase(),
      email: session.customer_details?.email ?? null,
      paid: session.payment_status === "paid",
    };
  } catch (err) {
    console.error("[checkout/success] could not verify session", err);
    return null;
  }
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const confirmed = await verify(session_id);

  return (
    <>
      {confirmed?.paid && <ClearBagOnConfirm />}

      <Masthead
        eyebrow="Order"
        title={confirmed?.paid ? "Thank you — your order is with us." : "Nothing has been charged."}
        lede={
          confirmed?.paid
            ? "We will write within one working day to confirm your finishes and a production slot. Nothing is cut until you have replied to that email."
            : "We could not confirm a completed payment for this visit, so no order has been placed and your bag has been left exactly as it was."
        }
      />

      <div className="gutter pb-[var(--spacing-section)]">
        {confirmed?.paid ? (
          <div className="max-w-[44rem]">
            <dl className="rule-t">
              <Row label="Reference" value={confirmed.reference} numeric />
              {confirmed.amountTotal !== null && (
                <Row label="Total paid" value={formatPrice(confirmed.amountTotal)} numeric />
              )}
              {confirmed.email && <Row label="Confirmation sent to" value={confirmed.email} />}
              <Row label="Next step" value="Finish confirmation by email, within one working day" />
            </dl>

            <div className="mt-10 space-y-4">
              <h2 className="label-lg text-ink">What happens now</h2>
              <ol className="space-y-3">
                {[
                  "We check your finishes against current stock of cloth and stone, and tell you if anything needs to change.",
                  "You confirm. Only then does the piece enter the production schedule.",
                  "We contact you again about four weeks before despatch to agree a delivery window and check access.",
                  "A two-person team delivers, unpacks in the room, and removes all packaging.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="label shrink-0 pt-0.5 text-mist" data-numeric>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-body text-smoke">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-10 text-small text-smoke">
              Any question about this order:{" "}
              <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
                {brand.email.general}
              </a>{" "}
              or{" "}
              <a href={`tel:${brand.telephone.href}`} className="link-draw text-ink" data-numeric>
                {brand.telephone.display}
              </a>
              . Quote your reference.
            </p>

            <div className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href="/furniture" variant="outline">
                Back to the catalogue
              </ButtonLink>
              <ButtonLink href="/journal" variant="ghost" className="h-12 px-4">
                Read the journal
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="max-w-[40rem]">
            <p className="text-body text-smoke">
              If you reached this page from a completed payment and it is not showing, do not pay
              again — write to{" "}
              <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
                {brand.email.general}
              </a>{" "}
              and we will find the transaction.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/bag" variant="solid">
                Return to your bag
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact the studio
              </ButtonLink>
            </div>
            <p className="label mt-10 text-mist">
              <Link href="/legal/terms#payment" className="link-draw text-smoke">
                How payment works
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, numeric }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-8 gap-y-1 rule-b py-4">
      <dt className="label text-mist">{label}</dt>
      <dd
        className={numeric ? "label-lg tabular-nums text-ink" : "label-lg text-ink"}
        {...(numeric ? { "data-numeric": true } : {})}
      >
        {value}
      </dd>
    </div>
  );
}
