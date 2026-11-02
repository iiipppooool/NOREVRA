/**
 * Whether sign-in is wired up on this deployment.
 *
 * Auth.js cannot be constructed without a secret, so this has to be checked
 * before the module is touched — not after. Everything the account area shows
 * follows from it, and the sign-in page says plainly when it is false rather
 * than offering a button that cannot work.
 */
export function authConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET,
  );
}

export const AUTH_REQUIREMENTS = [
  "AUTH_SECRET — any high-entropy string. `openssl rand -base64 32` will do.",
  "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET — an OAuth 2.0 Client ID of type “Web application” from the Google Cloud console.",
  "Authorised redirect URI on that client: <your origin>/api/auth/callback/google",
  "AUTH_URL — only needed if the deployment origin is not detected automatically.",
] as const;

/** Order history reads from the payment provider, so it needs that too. */
export const ORDERS_REQUIREMENTS = [
  "STRIPE_SECRET_KEY — order history is read back from Stripe Checkout, so no separate order database is required.",
] as const;
