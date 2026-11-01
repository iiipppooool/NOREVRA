import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { subscribe } from "@/lib/integrations";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().trim().min(5).max(254).email(),
  /** Honeypot. A real visitor never fills this. */
  company: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "newsletter"), { limit: 6, windowMs: 60_000 });
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
    return NextResponse.json(
      { ok: false, error: "Enter an email address we can reach you at." },
      { status: 422 },
    );
  }

  try {
    const result = await subscribe(parsed.data.email.toLowerCase());
    return NextResponse.json({ ok: true, delivered: result.delivered, detail: result.detail });
  } catch (err) {
    console.error("[newsletter] delivery failed", err);
    return NextResponse.json(
      { ok: false, error: "We could not record that just now. Please try again." },
      { status: 502 },
    );
  }
}
