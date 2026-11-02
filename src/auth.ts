import NextAuth, { type NextAuthResult, type Session } from "next-auth";
import Google from "next-auth/providers/google";
import { authConfigured } from "@/lib/auth-config";

/**
 * Authentication.
 *
 * Google only, and sessions held in a signed JWT cookie rather than a
 * database — which means sign-in works with nothing but an OAuth client, and
 * there is no store of customer data to look after. Order history is read
 * back from the payment provider (see src/lib/orders.ts), so an account needs
 * no table of its own either.
 *
 * When the environment is not configured the module exports inert stubs
 * instead of throwing at import time, so every page still renders and the
 * account area explains what is missing.
 */
const configured = authConfigured();

const result: Partial<NextAuthResult> = configured
  ? NextAuth({
      providers: [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          // We ask for nothing beyond identity. No contacts, no Drive.
          authorization: { params: { scope: "openid email profile", prompt: "select_account" } },
        }),
      ],
      session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
      pages: { signIn: "/account/sign-in", error: "/account/sign-in" },
      callbacks: {
        async jwt({ token, profile }) {
          if (profile?.email) token.email = profile.email;
          if (profile?.name) token.name = profile.name;
          if (typeof profile?.picture === "string") token.picture = profile.picture;
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.email = (token.email as string) ?? session.user.email;
            session.user.name = (token.name as string) ?? session.user.name;
            session.user.image = (token.picture as string) ?? session.user.image;
          }
          return session;
        },
      },
      trustHost: true,
    })
  : {};

export const handlers = result.handlers ?? {
  GET: unconfiguredHandler,
  POST: unconfiguredHandler,
};

export const signIn = result.signIn ?? (async () => { throw new Error("Sign-in is not configured."); });
export const signOut = result.signOut ?? (async () => { throw new Error("Sign-in is not configured."); });

/** Always safe to call: returns null when sign-in is not configured. */
export const auth: () => Promise<Session | null> = result.auth
  ? (result.auth as unknown as () => Promise<Session | null>)
  : async () => null;

function unconfiguredHandler() {
  return Response.json(
    { ok: false, reason: "not_configured", error: "Sign-in is not configured on this deployment." },
    { status: 503 },
  );
}
