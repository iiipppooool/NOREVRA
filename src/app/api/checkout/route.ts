import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { stripeConfigured, CHECKOUT_REQUIREMENTS } from "@/lib/integrations";
import { productBySlug, variantPrice } from "@/data/products";
import { materialMap } from "@/data/materials";
import { brand } from "@/data/brand";
import { siteUrl, absolute } from "@/lib/seo";

export const runtime = "nodejs";

const Line = z.object({
  slug: z.string().min(1).max(80),
  variantId: z.string().min(1).max(40),
  options: z.record(z.string().max(40), z.string().max(60)).default({}),
  qty: z.number().int().min(1).max(20),
});

const Body = z.object({ lines: z.array(Line).min(1).max(30) });

/**
 * Creates a Stripe Checkout Session.
 *
 * Prices, names and finishes are resolved from the catalogue on the server.
 * The request body supplies identity and quantity only — a client cannot
 * influence what anything costs.
 *
 * With no STRIPE_SECRET_KEY this returns 501 and the exact configuration
 * required, which the bag page renders. It never reports a payment that did
 * not happen.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "checkout"), { limit: 12, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "That bag could not be read." }, { status: 422 });
  }

  // --- Re-price from the catalogue -----------------------------------------
  const items: {
    name: string;
    description: string;
    unitAmount: number;
    quantity: number;
    images: string[];
  }[] = [];

  for (const line of parsed.data.lines) {
    const product = productBySlug(line.slug);
    if (!product) {
      return NextResponse.json(
        { ok: false, error: `“${line.slug}” is no longer in the catalogue. Please review your bag.` },
        { status: 409 },
      );
    }
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return NextResponse.json(
        { ok: false, error: `That size of the ${product.name} is no longer offered.` },
        { status: 409 },
      );
    }
    const finishes = product.options
      .map((g) => materialMap[line.options[g.id]]?.name)
      .filter(Boolean)
      .join(" · ");

    items.push({
      name: `${brand.name} ${product.name} — ${variant.label}`,
      description: [finishes, `Made to order, ${product.leadTime}`].filter(Boolean).join(". "),
      unitAmount: variantPrice(product, variant.id),
      quantity: line.qty,
      images: [absolute(product.images[0].src)],
    });
  }

  const total = items.reduce((n, i) => n + i.unitAmount * i.quantity, 0);

  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        reason: "not_configured",
        error: "Card payment is not connected on this deployment.",
        // The bag priced the order correctly; only the payment step is absent.
        quote: {
          currency: brand.commerce.currency,
          total,
          lines: items.map((i) => ({
            name: i.name,
            description: i.description,
            unitAmount: i.unitAmount,
            quantity: i.quantity,
          })),
        },
        requires: CHECKOUT_REQUIREMENTS,
      },
      { status: 501 },
    );
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "hosted",
      line_items: items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: brand.commerce.currency.toLowerCase(),
          unit_amount: i.unitAmount,
          product_data: {
            name: i.name,
            description: i.description,
            images: i.images,
          },
        },
      })),
      // Made-to-order goods shipped from Italy: collect a full address, and
      // let Stripe handle the tax treatment per destination.
      shipping_address_collection: {
        allowed_countries: [
          "IT", "FR", "DE", "ES", "NL", "BE", "AT", "PT", "IE", "SE", "DK", "FI",
          "GB", "CH", "US", "CA", "AE", "SG", "HK", "AU", "JP", "NO", "LU", "MC",
        ],
      },
      phone_number_collection: { enabled: true },
      billing_address_collection: "required",
      custom_text: {
        submit: {
          message:
            "Every piece is made to order. We will confirm your finishes and a delivery window by email before production begins.",
        },
      },
      consent_collection: { terms_of_service: "required" },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/bag?checkout=cancelled`,
      metadata: {
        source: "norevra.com",
        lineCount: String(items.length),
      },
    });

    if (!session.url) throw new Error("Stripe returned a session without a URL");
    return NextResponse.json({ ok: true, url: session.url, id: session.id });
  } catch (err) {
    console.error("[checkout] session creation failed", err);
    return NextResponse.json(
      {
        ok: false,
        reason: "provider_error",
        error: "We could not open checkout. Please try again, or email the studio to order directly.",
      },
      { status: 502 },
    );
  }
}
