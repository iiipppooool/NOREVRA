import { NextResponse, type NextRequest } from "next/server";

/**
 * Account-area guard.
 *
 * The pages check the session properly with `auth()`; this only moves the
 * browser before any of that renders. Doing it here rather than with
 * `redirect()` inside the page is deliberate: a redirect thrown during a
 * Server Component render is resolved inline, so the sign-in page appears
 * at /account and the URL never changes — which breaks bookmarking, the
 * back button and the `next` parameter.
 *
 * The cookie is only checked for presence. It is not trusted and it is not
 * verified here; the page does that. A forged cookie gets you as far as a
 * page that then redirects you back.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function configured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/account/sign-in")) return NextResponse.next();

  const signIn = new URL("/account/sign-in", req.url);

  if (!configured()) return NextResponse.redirect(signIn);

  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (hasSession) return NextResponse.next();

  signIn.searchParams.set("next", pathname + search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account", "/account/:path*"],
};
