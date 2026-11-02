import "server-only";
import { stripeConfigured } from "./integrations";

export type OrderLine = { description: string; quantity: number; amount: number };

export type Order = {
  id: string;
  reference: string;
  placed: string;
  status: "paid" | "pending" | "cancelled";
  currency: string;
  total: number;
  lines: OrderLine[];
  receiptUrl: string | null;
};

export type OrderResult =
  | { state: "ok"; orders: Order[] }
  | { state: "not_configured" }
  | { state: "error"; message: string };

/**
 * Order history.
 *
 * Read back from Stripe Checkout rather than from a table of our own: the
 * payment provider already holds every completed session, so the account area
 * needs no customer database and we store nothing about anyone. The trade-off
 * is that history only exists for orders paid through Checkout — which, for
 * this shop, is all of them.
 */
export async function ordersFor(email: string | null | undefined): Promise<OrderResult> {
  if (!email) return { state: "ok", orders: [] };
  if (!stripeConfigured()) return { state: "not_configured" };

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const customers = await stripe.customers.list({ email, limit: 10 });
    if (customers.data.length === 0) return { state: "ok", orders: [] };

    const orders: Order[] = [];
    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 25,
        expand: ["data.line_items"],
      });
      for (const s of sessions.data) {
        if (s.payment_status === "unpaid" && s.status === "open") continue;
        orders.push({
          id: s.id,
          reference: s.id.slice(-12).toUpperCase(),
          placed: new Date(s.created * 1000).toISOString(),
          status:
            s.payment_status === "paid"
              ? "paid"
              : s.status === "expired"
                ? "cancelled"
                : "pending",
          currency: (s.currency ?? "eur").toUpperCase(),
          total: s.amount_total ?? 0,
          lines: (s.line_items?.data ?? []).map((li) => ({
            description: li.description ?? "Item",
            quantity: li.quantity ?? 1,
            amount: li.amount_total ?? 0,
          })),
          receiptUrl: null,
        });
      }
    }
    orders.sort((a, b) => b.placed.localeCompare(a.placed));
    return { state: "ok", orders };
  } catch (err) {
    console.error("[orders] lookup failed", err);
    return { state: "error", message: "We could not reach the payment provider just now." };
  }
}
