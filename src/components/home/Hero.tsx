"use client";

import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { heroSlides } from "@/data/assets";
import focusMap from "@/data/focus.json";
import { collections } from "@/data/collections";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const DURATION = 7600;
const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 90);
    return () => window.clearTimeout(t);
  }, []);

  const go = useCallback((n: number) => {
    setIndex(((n % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }, []);

  // Auto-advance, paused while the tab is hidden and off entirely for anyone
  // who has asked for reduced motion — the indicators still work.
  useEffect(() => {
    if (reduced) return;
    const tick = () => {
      if (!document.hidden) setIndex((i) => (i + 1) % heroSlides.length);
    };
    timer.current = window.setInterval(tick, DURATION);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [reduced]);

  const slide = heroSlides[index];
  const collection = collections.find((c) => `/collections/${c.id}` === slide.href);

  return (
    <section
      aria-label="Introduction"
      className="relative isolate flex h-[100svh] min-h-[34rem] flex-col justify-between overflow-hidden bg-ink lg:justify-end"
    >
      {/* Frames */}
      <div className="absolute inset-0 -z-10">
        {heroSlides.map((s, i) => {
          const common = {
            alt: i === index ? s.alt : "",
            fill: true as const,
            priority: i === 0,
            quality: 80,
          };
          // Art direction, not a crop: the phone gets its own composition.
          // getImageProps lets a <picture> choose between them while both
          // still go through the image optimiser, and only one downloads.
          const wide = getImageProps({ ...common, src: s.src, sizes: "100vw" }).props;
          const tall = getImageProps({ ...common, src: s.portrait.src, sizes: "100vw" }).props;
          const focus = (focusMap as Record<string, string>)[s.src] ?? "center 66%";
          return (
            <div
              key={s.src}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <picture>
                <source media="(max-width: 767px)" srcSet={tall.srcSet} sizes="100vw" />
                <source media="(min-width: 768px)" srcSet={wide.srcSet} sizes="100vw" />
                <img
                  {...wide}
                  alt={common.alt}
                  style={{ "--focus": focus } as React.CSSProperties}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-center md:[object-position:var(--focus)]",
                    !reduced &&
                      "transition-transform duration-[9000ms] ease-linear will-change-transform",
                    !reduced && (i === index ? "scale-[1.055]" : "scale-100"),
                  )}
                />
              </picture>
            </div>
          );
        })}
        {/* Legibility. Two gradients rather than one flat scrim, so the image
            keeps its depth at the top of the frame. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,14,11,0.78)_0%,rgba(16,14,11,0.46)_22%,rgba(16,14,11,0.04)_50%,rgba(16,14,11,0.1)_76%,rgba(16,14,11,0.34)_100%)] lg:bg-[linear-gradient(to_top,rgba(16,14,11,0.78)_0%,rgba(16,14,11,0.34)_34%,rgba(16,14,11,0.08)_62%,rgba(16,14,11,0.26)_100%)]"
        />
        <div
          aria-hidden
          className="grain absolute inset-0 opacity-70 after:opacity-[0.14]"
        />
      </div>

      {/* Copy. Held at the top on a phone, where the frame crops to the
          centre and the furniture occupies the lower half; dropped to the
          foot of the frame from large up, where there is room beside it. */}
      <div data-over-image className="gutter relative pb-6 pt-[7rem] lg:pb-[clamp(2.5rem,6vh,5rem)] lg:pt-32">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "110%" }}
                animate={entered ? { y: 0 } : {}}
                transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
                className="label text-alabaster/70"
              >
                New house · Catalogue open
              </motion.p>
            </div>

            <h1 className="mt-5 font-display text-hero text-alabaster">
              {["Drawn in Milan.", "Made in Brianza."].map((line, i) => (
                <span key={line} className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={{ y: "108%" }}
                    animate={entered ? { y: 0 } : {}}
                    transition={{ duration: 1.35, ease: EASE, delay: 0.2 + i * 0.1 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={entered ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.62 }}
              className="mt-9 flex flex-wrap items-center gap-3.5"
            >
              <ButtonLink href={slide.href} variant="light" size="lg">
                {collection ? `View ${collection.name}` : slide.hrefLabel}
              </ButtonLink>
              <ButtonLink
                href="/furniture"
                variant="light"
                size="lg"
                className="border-transparent text-alabaster/75 hover:border-transparent hover:bg-transparent hover:text-alabaster"
              >
                All furniture
              </ButtonLink>
            </motion.div>
          </div>

          {/* Frame caption and indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="hidden lg:col-span-4 lg:block lg:pb-2"
          >
            <div className="flex items-end justify-between gap-8 lg:flex-col lg:items-end">
              <div className="min-h-[3.25rem] lg:text-right">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.src}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <p className="label text-alabaster/72">
                      Frame {String(index + 1).padStart(2, "0")} /{" "}
                      {String(heroSlides.length).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-display text-[1.25rem] italic text-alabaster/90">
                      {slide.caption}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div
                className="flex items-center gap-2.5"
                role="tablist"
                aria-label="Hero frames"
              >
                {heroSlides.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show frame ${i + 1}: ${s.caption}`}
                    onClick={() => go(i)}
                    className="group relative h-6 w-10 cursor-pointer"
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transition-colors duration-500",
                        i === index ? "bg-alabaster/35" : "bg-alabaster/20 group-hover:bg-alabaster/40",
                      )}
                    />
                    {i === index && (
                      <motion.span
                        key={`${index}-fill`}
                        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-alabaster"
                        initial={{ width: reduced ? "100%" : 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: reduced ? 0 : DURATION / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Frame caption and indicators, phone only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.8 }}
        data-over-image
        className="gutter relative flex items-end justify-between gap-6 pb-[clamp(1.75rem,4vh,2.75rem)] lg:hidden"
      >
        <div className="min-h-[3rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.src}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <p className="label text-alabaster/72">
                Frame {String(index + 1).padStart(2, "0")} /{" "}
                {String(heroSlides.length).padStart(2, "0")}
              </p>
              <p className="mt-1.5 font-display text-[1.125rem] italic text-alabaster/90">
                {slide.caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 pb-1" role="tablist" aria-label="Hero frames">
          {heroSlides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show frame ${i + 1}: ${s.caption}`}
              onClick={() => go(i)}
              className="relative h-6 w-8 cursor-pointer"
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transition-colors duration-500",
                  i === index ? "bg-alabaster" : "bg-alabaster/25",
                )}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 1.4, delay: 1.1 }}
        aria-hidden
        className="pointer-events-none absolute bottom-[clamp(2.5rem,6vh,5rem)] left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <span className="relative block h-14 w-px overflow-hidden bg-alabaster/20">
          <span className="absolute inset-x-0 top-0 h-5 animate-[scrollcue_2.6s_cubic-bezier(0.76,0,0.24,1)_infinite] bg-alabaster/80" />
        </span>
      </motion.div>
    </section>
  );
}
