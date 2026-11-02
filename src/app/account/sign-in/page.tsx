import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { authConfigured, AUTH_REQUIREMENTS } from "@/lib/auth-config";
import { brand } from "@/data/brand";
import { buildMetadata } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { GoogleSignIn } from "@/components/account/SignInButtons";
import { ButtonLink } from "@/components/ui/Button";

/** Personal, and session-dependent: never prerendered or cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to see your orders.",
  path: "/account/sign-in",
  noIndex: true,
});

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const session = await auth();
  if (session?.user) redirect(next && next.startsWith("/") ? next : "/account");

  const ready = authConfigured();

  return (
    <>
      <Masthead
        eyebrow="Account"
        title="Sign in"
        lede="An account exists for one reason: so you can look up what you ordered, and what we said about when it would arrive. We keep nothing else."
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="rule-t pt-9">
              {error && (
                <p role="alert" className="mb-7 text-small text-clay">
                  That sign-in did not complete. Please try again, or write to{" "}
                  <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
                    {brand.email.general}
                  </a>
                  .
                </p>
              )}

              {ready ? (
                <>
                  <GoogleSignIn next={next && next.startsWith("/") ? next : "/account"} />
                  <p className="label mt-6 max-w-[26rem] text-mist">
                    There is no password to set and no form to fill in. Signing in with Google
                    creates your account the first time.
                  </p>
                </>
              ) : (
                <div role="status">
                  <p className="editorial text-ink">Sign-in is not connected on this deployment.</p>
                  <p className="mt-4 max-w-[32rem] text-small text-smoke">
                    Nothing is broken — the account area simply has no identity provider behind it
                    yet, so there is no button here that could work. You can order as a guest, and
                    we will confirm everything by email.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href="/furniture" variant="solid">
                      Continue to the catalogue
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="outline">
                      Ask about an order
                    </ButtonLink>
                  </div>
                  <details className="mt-9">
                    <summary className="label cursor-pointer text-mist">
                      Configuration required to enable sign-in
                    </summary>
                    <ul className="mt-4 space-y-2">
                      {AUTH_REQUIREMENTS.map((r) => (
                        <li key={r} className="max-w-[36rem] text-small text-smoke">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="rule-t pt-9">
              <h2 className="label-lg text-ink">What an account is for</h2>
              <ul className="mt-6 space-y-5">
                {[
                  ["Your orders", "What you bought, in which finishes, and what we quoted for delivery."],
                  ["Nothing else", "No stored addresses, no saved cards, no marketing profile. Your bag and saved pieces stay in this browser, as they do now."],
                  ["No password", "We never hold one, so we can never lose one."],
                ].map(([k, v]) => (
                  <li key={k}>
                    <p className="label text-mist">{k}</p>
                    <p className="mt-1.5 text-small text-smoke">{v}</p>
                  </li>
                ))}
              </ul>
              <p className="label mt-8 text-mist">
                <Link href="/legal/privacy" className="link-draw text-smoke">
                  What we do with your details
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
