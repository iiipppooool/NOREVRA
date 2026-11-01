"use client";

import { useEffect } from "react";
import Link from "next/link";
import { brand } from "@/data/brand";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the platform logs; the digest is what support will ask for.
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="gutter flex min-h-[70svh] flex-col justify-center py-24">
      <p className="label text-mist">Something went wrong</p>
      <h1 className="mt-6 max-w-[34rem] font-display text-display text-ink">
        We have broken something, not you.
      </h1>
      <p className="editorial mt-7 max-w-[32rem] text-smoke">
        The page failed to render. Trying again often resolves it. If it does not, the studio would
        genuinely like to know.
      </p>

      {error.digest && (
        <p className="label mt-7 text-mist" data-numeric>
          Reference {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="label-lg h-12 bg-ink px-7 text-alabaster transition-colors duration-500 hover:bg-graphite"
        >
          Try again
        </button>
        <Link href="/" className="link-draw label-lg text-ink">
          Return home
        </Link>
        <a href={`mailto:${brand.email.general}`} className="link-draw label text-smoke">
          {brand.email.general}
        </a>
      </div>
    </div>
  );
}
