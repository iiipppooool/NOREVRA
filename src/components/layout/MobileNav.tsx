"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { brand } from "@/data/brand";
import { primaryNav } from "@/data/navigation";
import { collections } from "@/data/collections";
import { categories } from "@/data/types";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Full-height panel rather than a dropdown: on a phone the navigation is a
 * destination, so it gets the same art direction as a page — a stack of
 * serif display links over ivory, with the collection list below.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus(), 420);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.78, ease: EASE }}
          className="fixed inset-0 z-[130] flex flex-col overflow-y-auto overscroll-contain bg-ivory lg:hidden"
        >
          <div className="gutter flex h-[5.75rem] shrink-0 items-center justify-between">
            <Link href="/" onClick={onClose} className="wordmark text-[0.8125rem] text-ink">
              {brand.wordmark}
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-2 grid h-11 w-11 place-items-center text-ink"
            >
              <X size={19} strokeWidth={1.3} />
            </button>
          </div>

          <nav aria-label="Primary" className="gutter flex-1 pb-16 pt-6">
            <ul className="rule-t">
              {primaryNav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.22 + i * 0.055 }}
                  className="rule-b"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-baseline justify-between gap-4 py-5"
                  >
                    <span className="font-display text-[2rem] leading-none text-ink">
                      {item.label}
                    </span>
                    <span className="label text-mist" data-numeric>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 gap-10"
            >
              <div>
                <p className="label mb-4 text-mist">Collections</p>
                <ul className="space-y-2.5">
                  {collections.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/collections/${c.id}`}
                        onClick={onClose}
                        className="label-lg text-smoke"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label mb-4 text-mist">Typology</p>
                <ul className="space-y-2.5">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/furniture?category=${c.id}`}
                        onClick={onClose}
                        className="label-lg text-smoke"
                      >
                        {c.plural}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.62 }}
              className="mt-14 rule-t pt-7"
            >
              <Link href="/wishlist" onClick={onClose} className="label-lg block text-ink">
                Saved pieces
              </Link>
              <a href={`mailto:${brand.email.general}`} className="label mt-5 block text-smoke">
                {brand.email.general}
              </a>
              <a href={`tel:${brand.telephone.href}`} className="label mt-2 block text-smoke">
                {brand.telephone.display}
              </a>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
