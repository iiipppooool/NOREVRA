"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Status = "idle" | "sending" | "done" | "error";

/**
 * Validated client-side for immediacy and again on the server, which is the
 * only validation that counts. On success the field is replaced by the
 * confirmation rather than clearing, so there is no ambiguity about whether
 * it worked.
 */
export function NewsletterForm({ tone = "light" }: { tone?: "light" | "ink" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const light = tone === "light";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError("Enter an email address we can reach you at.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setStatus("error");
        setError(body.error ?? "That did not go through. Please try again.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("We could not reach the server. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        className={cn("text-small", light ? "text-alabaster/80" : "text-smoke")}
      >
        Thank you — you are on the list. We write four or five times a year, never more.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div
        className={cn(
          "flex items-end gap-4 border-b pb-3 transition-colors duration-500",
          error
            ? "border-clay"
            : light
              ? "border-alabaster/30 focus-within:border-alabaster"
              : "border-hairline focus-within:border-ink",
        )}
      >
        <div className="flex-1">
          <label
            htmlFor="newsletter-email"
            className={cn("label block pb-2.5", light ? "text-alabaster/55" : "text-mist")}
          >
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "newsletter-error" : undefined}
            className={cn(
              "w-full bg-transparent text-[0.9375rem] outline-none",
              light
                ? "text-alabaster placeholder:text-alabaster/30"
                : "text-ink placeholder:text-mist",
            )}
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className={cn(
            "group mb-0.5 grid h-9 w-9 shrink-0 place-items-center transition-opacity duration-300 disabled:opacity-40",
            light ? "text-alabaster" : "text-ink",
          )}
          aria-label="Subscribe"
        >
          <ArrowRight
            size={17}
            strokeWidth={1.4}
            className="transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          />
        </button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="label mt-3 text-clay">
          {error}
        </p>
      )}
    </form>
  );
}
