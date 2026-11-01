"use client";

import { useState } from "react";
import { Field, TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { brand } from "@/data/brand";

const TOPICS = [
  "General enquiry",
  "A specific piece",
  "Trade and specification",
  "Material samples",
  "Showroom appointment",
  "Care and repair",
] as const;

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    topic: defaultTopic && TOPICS.includes(defaultTopic as (typeof TOPICS)[number])
      ? defaultTopic
      : TOPICS[0],
    subject: "",
    message: "",
    reference: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "logged">("idle");

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as keyof Errors]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  function validate(): Errors {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = "Tell us your name.";
    if (!EMAIL.test(values.email.trim())) e.email = "Enter an email address we can reply to.";
    if (values.subject.trim().length < 3) e.subject = "A short subject, please.";
    if (values.message.trim().length < 20)
      e.message = "Twenty characters or more, so we can be useful.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setErrors({ ...(body.fields ?? {}), form: body.error ?? "That did not send." });
        setStatus("idle");
        return;
      }
      setStatus(body.delivered ? "sent" : "logged");
    } catch {
      setErrors({ form: "We could not reach the server. Please email us directly." });
      setStatus("idle");
    }
  }

  if (status === "sent" || status === "logged") {
    return (
      <div role="status" className="rule-t pt-9">
        <p className="editorial text-ink">Thank you — your message is with us.</p>
        {status === "sent" ? (
          <p className="mt-4 max-w-[32rem] text-small text-smoke">
            We answer every enquiry within one working day. If it is urgent, call the studio on{" "}
            <a href={`tel:${brand.telephone.href}`} className="link-draw text-ink" data-numeric>
              {brand.telephone.display}
            </a>
            .
          </p>
        ) : (
          <p className="mt-4 max-w-[34rem] text-small text-smoke">
            Your message was received and validated by the site, but this deployment has no email
            transport connected, so it has not yet reached a mailbox. Please also write to{" "}
            <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
              {brand.email.general}
            </a>{" "}
            so nothing is lost.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rule-t pt-9">
      <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          required
        />
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          required
        />
        <Field
          label="Practice or company"
          name="company"
          autoComplete="organization"
          hint="Optional"
          value={values.company}
          onChange={set("company")}
        />
        <SelectField label="Subject area" name="topic" value={values.topic} onChange={set("topic")}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <Field
          label="Subject"
          name="subject"
          value={values.subject}
          onChange={set("subject")}
          error={errors.subject}
          className="sm:col-span-2"
          required
        />
        <TextArea
          label="Message"
          name="message"
          value={values.message}
          onChange={set("message")}
          error={errors.message}
          className="sm:col-span-2"
          required
        />
      </div>

      {/* Honeypot. Hidden from everyone who is not a crawler. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="reference">Reference</label>
        <input
          id="reference"
          name="reference"
          tabIndex={-1}
          autoComplete="off"
          value={values.reference}
          onChange={set("reference")}
        />
      </div>

      {errors.form && (
        <p role="alert" className="mt-7 text-small text-clay">
          {errors.form}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="label max-w-[20rem] text-mist">
          We reply within one working day. Your details are used only to answer you.
        </p>
      </div>
    </form>
  );
}
