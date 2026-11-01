/**
 * Outbound integrations.
 *
 * Every adapter reports whether it is actually configured. Nothing here
 * pretends to have delivered something it has not — the API routes pass that
 * state back to the client, and the forms say so plainly.
 */

export type Delivery = { delivered: boolean; detail: string };

const NOT_CONFIGURED: (name: string, envs: string[]) => Delivery = (name, envs) => ({
  delivered: false,
  detail: `${name} is not configured. Set ${envs.join(" and ")} to deliver.`,
});

/* ------------------------------------------------------------ newsletter -- */

export function newsletterConfigured(): boolean {
  return Boolean(process.env.NEWSLETTER_API_URL && process.env.NEWSLETTER_API_KEY);
}

export async function subscribe(email: string): Promise<Delivery> {
  if (!newsletterConfigured()) {
    console.info("[newsletter] subscription received, no provider configured:", email);
    return NOT_CONFIGURED("The mailing list", ["NEWSLETTER_API_URL", "NEWSLETTER_API_KEY"]);
  }
  const res = await fetch(process.env.NEWSLETTER_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}`,
    },
    body: JSON.stringify({ email, source: "norevra.com" }),
  });
  if (!res.ok) {
    throw new Error(`Newsletter provider responded ${res.status}`);
  }
  return { delivered: true, detail: "Subscribed." };
}

/* --------------------------------------------------------------- enquiry -- */

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL);
}

export async function sendEnquiry(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  topic: string;
}): Promise<Delivery> {
  if (!mailConfigured()) {
    console.info("[enquiry] received, no mail transport configured:", {
      ...payload,
      message: `${payload.message.slice(0, 120)}…`,
    });
    return NOT_CONFIGURED("Email delivery", ["RESEND_API_KEY", "ENQUIRY_TO_EMAIL"]);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM_EMAIL ?? "Norevra <studio@norevra.com>",
      to: [process.env.ENQUIRY_TO_EMAIL],
      reply_to: payload.email,
      subject: `[${payload.topic}] ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.company ? `Practice: ${payload.company}` : null,
        `Topic: ${payload.topic}`,
        "",
        payload.message,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });
  if (!res.ok) {
    throw new Error(`Mail transport responded ${res.status}`);
  }
  return { delivered: true, detail: "Sent." };
}

/* -------------------------------------------------------------- payments -- */

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export const CHECKOUT_REQUIREMENTS = [
  "STRIPE_SECRET_KEY — a secret key from the Stripe dashboard. Use a test key (sk_test_…) first.",
  "NEXT_PUBLIC_SITE_URL — the deployed origin, so Stripe can return the customer to the right place.",
  "STRIPE_WEBHOOK_SECRET — optional until you need order fulfilment; required to confirm payment server-side.",
] as const;
