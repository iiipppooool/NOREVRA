"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** The Google mark, drawn rather than fetched. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export function GoogleSignIn({ next = "/account" }: { next?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      data-press
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void signIn("google", { redirectTo: next });
      }}
      className="group inline-flex h-14 items-center justify-center gap-3.5 border border-ink/35 px-8 label-lg text-ink transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-ink hover:bg-ink hover:text-alabaster disabled:opacity-40"
    >
      <span className="transition-opacity duration-300 group-hover:opacity-90">
        <GoogleMark />
      </span>
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => void signOut({ redirectTo: "/" })}>
      Sign out
    </Button>
  );
}
