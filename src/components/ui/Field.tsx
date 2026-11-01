"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Base = {
  label: string;
  error?: string;
  hint?: string;
  tone?: "ink" | "light";
  className?: string;
};

const wrap = "relative";
const labelCls =
  "label block mb-3 transition-colors duration-300";
const inputCls =
  "w-full bg-transparent border-b pb-3 text-[0.9375rem] leading-normal outline-none " +
  "transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

function tones(tone: "ink" | "light", invalid: boolean) {
  if (tone === "light") {
    return {
      label: invalid ? "text-clay" : "text-alabaster/65",
      input: cn(
        "text-alabaster placeholder:text-alabaster/35",
        invalid ? "border-clay" : "border-alabaster/30 focus:border-alabaster hover:border-alabaster/60",
      ),
    };
  }
  return {
    label: invalid ? "text-clay" : "text-smoke",
    input: cn(
      "text-ink placeholder:text-mist",
      invalid ? "border-clay" : "border-hairline focus:border-ink hover:border-smoke",
    ),
  };
}

export function Field({
  label,
  error,
  hint,
  tone = "ink",
  className,
  ...rest
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const t = tones(tone, Boolean(error));
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn(wrap, className)}>
      <label htmlFor={id} className={cn(labelCls, t.label)}>
        {label}
      </label>
      <input
        id={id}
        className={cn(inputCls, t.input)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className={cn("label mt-3", tone === "light" ? "text-alabaster/45" : "text-mist")}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="label mt-3 text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  error,
  hint,
  tone = "ink",
  className,
  ...rest
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const t = tones(tone, Boolean(error));
  return (
    <div className={cn(wrap, className)}>
      <label htmlFor={id} className={cn(labelCls, t.label)}>
        {label}
      </label>
      <textarea
        id={id}
        rows={5}
        className={cn(inputCls, t.input, "resize-none")}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="label mt-3 text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  tone = "ink",
  className,
  children,
  ...rest
}: Base & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const t = tones(tone, Boolean(error));
  return (
    <div className={cn(wrap, className)}>
      <label htmlFor={id} className={cn(labelCls, t.label)}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={cn(inputCls, t.input, "appearance-none pr-8 cursor-pointer")}
          {...rest}
        >
          {children}
        </select>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-1 top-1.5 h-2 w-2 rotate-45 border-b border-r",
            tone === "light" ? "border-alabaster/60" : "border-smoke",
          )}
        />
      </div>
    </div>
  );
}
