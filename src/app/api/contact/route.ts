import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sendEnquiry } from "@/lib/integrations";
import { enquiryTopics } from "@/data/brand";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().min(5).max(254).email("Enter an email address we can reply to."),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(enquiryTopics),
  subject: z.string().trim().min(3, "A short subject, please.").max(160),
  message: z.string().trim().min(20, "Twenty characters or more, so we can be useful.").max(4000),
  /** Honeypot. */
  reference: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "contact"), { limit: 4, windowMs: 120_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages from this connection. Please try again shortly." },
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
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ ok: false, error: "Please check the form.", fields }, { status: 422 });
  }

  try {
    const result = await sendEnquiry({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      company: parsed.data.company || undefined,
      topic: parsed.data.topic,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    return NextResponse.json({ ok: true, delivered: result.delivered, detail: result.detail });
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json(
      { ok: false, error: "We could not send that just now. Please email us directly." },
      { status: 502 },
    );
  }
}
