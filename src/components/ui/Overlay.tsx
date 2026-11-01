"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function useOverlayBehaviour(open: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  // Escape, and a focus trap across the panel's own tabbables.
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    window.__lenis?.stop();
    document.addEventListener("keydown", onKeyDown);

    const t = window.setTimeout(() => {
      panel.current
        ?.querySelector<HTMLElement>('[data-autofocus],button,a[href],input,select,textarea')
        ?.focus();
    }, 90);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      window.__lenis?.start();
      restoreTo.current?.focus?.();
    };
  }, [open, onKeyDown]);

  return panel;
}

function Scrim({ onClose }: { onClose: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Close"
      tabIndex={-1}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[2px]"
    />
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
}) {
  const panel = useOverlayBehaviour(open, onClose);
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]" role="presentation">
          <Scrim onClose={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.72, ease: EASE }}
            className={cn(
              "absolute inset-y-0 flex w-full max-w-[min(30rem,100vw)] flex-col bg-alabaster shadow-[0_0_80px_rgba(20,18,14,0.22)]",
              side === "right" ? "right-0" : "left-0",
            )}
          >
            <header className="flex items-center justify-between gap-6 rule-b px-7 py-6">
              <h2 className="label-lg">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 grid h-10 w-10 place-items-center text-ink opacity-60 transition-opacity duration-300 hover:opacity-100"
                aria-label={`Close ${title.toLowerCase()}`}
              >
                <X size={17} strokeWidth={1.3} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7">{children}</div>
            {footer && <div className="rule-t px-7 py-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useOverlayBehaviour(open, onClose);
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4 sm:p-8" role="presentation">
          <Scrim onClose={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.6, ease: EASE }}
            className={cn(
              "relative max-h-[min(90vh,52rem)] w-full max-w-[66rem] overflow-y-auto overscroll-contain bg-alabaster shadow-[0_30px_120px_rgba(20,18,14,0.3)]",
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center bg-alabaster/80 text-ink opacity-70 backdrop-blur transition-opacity duration-300 hover:opacity-100"
              aria-label={`Close ${title.toLowerCase()}`}
            >
              <X size={17} strokeWidth={1.3} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
