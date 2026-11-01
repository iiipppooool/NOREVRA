"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import type { ProductImage } from "@/data/types";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/Media";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Product gallery.
 *
 * Desktop: one large frame with a crossfade between states, a thumbnail rail,
 * arrow-key navigation and a full-bleed lightbox.
 * Mobile: a scroll-snapped row, because a swipe is the correct gesture on a
 * phone and no amount of chrome improves on it.
 */
export function Gallery({
  images,
  name,
  /** Changes when the chosen finish changes; brings the lead frame back. */
  finishKey,
}: {
  images: ProductImage[];
  name: string;
  finishKey?: string;
}) {
  const [index, setIndex] = useState(0);
  const [lastFinish, setLastFinish] = useState(finishKey);
  if (finishKey !== lastFinish) {
    setLastFinish(finishKey);
    if (index !== 0) setIndex(0);
  }
  const [zoom, setZoom] = useState(false);
  const [dir, setDir] = useState(1);
  const rail = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      const n = ((next % images.length) + images.length) % images.length;
      setDir(n > index || (index === images.length - 1 && n === 0) ? 1 : -1);
      setIndex(n);
    },
    [images.length, index],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Escape") setZoom(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, index]);

  useEffect(() => {
    if (!zoom) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [zoom]);

  const active = images[index];
  const isDrawing = active.kind === "elevation";

  // Track which frame is centred in the mobile rail.
  const onRailScroll = () => {
    const el = rail.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index && i >= 0 && i < images.length) setIndex(i);
  };

  return (
    <div>
      {/* ---------------------------------------------------------- mobile */}
      <div className="lg:hidden">
        <div
          ref={rail}
          onScroll={onRailScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          aria-label={`${name} — image gallery`}
        >
          {images.map((img, i) => (
            <div key={img.src} className="w-full shrink-0 snap-center">
              <Media
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                aspect="aspect-[4/5]"
                sizes="100vw"
                priority={i === 0}
                curtain={i === 0}
                grain={img.kind !== "elevation"}
                imgClassName={img.kind === "elevation" ? "object-contain p-6" : undefined}
                quality={76}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gutter">
          <p className="label text-mist" data-numeric>
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
          <div className="flex gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => {
                  rail.current?.scrollTo({
                    left: i * (rail.current?.clientWidth ?? 0),
                    behavior: "smooth",
                  });
                }}
                data-press-dim
                className="grid h-11 w-7 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    i === index ? "w-5 bg-ink" : "w-1.5 bg-hairline",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <p className="gutter mt-3 text-small text-mist">{active.alt}</p>
      </div>

      {/* --------------------------------------------------------- desktop */}
      <div className="hidden lg:block">
        <motion.div
          data-cursor="Enlarge"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.045}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            // Either a decisive flick or a deliberate drag advances a frame.
            if (info.offset.x < -70 || info.velocity.x < -480) go(index + 1);
            else if (info.offset.x > 70 || info.velocity.x > 480) go(index - 1);
          }}
          className={cn(
            "group relative aspect-[4/5] cursor-grab overflow-hidden active:cursor-grabbing",
            isDrawing ? "bg-ivory" : "bg-limestone",
          )}
        >
          {/* A dissolve with a slow push in. A sliding carousel reads as
              software; a dissolve reads as a change of plate. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={active.src}
              initial={{ opacity: 0, scale: 1.045, x: dir * 14 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{
                opacity: 0,
                scale: 1.015,
                // An exit should clear quickly; only the entrance is allowed
                // to take its time.
                transition: { duration: 0.42, ease: "easeIn" },
              }}
              transition={{
                opacity: { duration: 0.62, ease: EASE },
                scale: { duration: 1.25, ease: EASE },
                x: { duration: 0.9, ease: EASE },
              }}
              className="absolute inset-0"
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(min-width:1280px) 52vw, 60vw"
                priority={index === 0}
                quality={82}
                className={cn(isDrawing ? "object-contain p-12" : "object-cover")}
              />
              {!isDrawing && <span aria-hidden className="grain absolute inset-0" />}
            </motion.div>
          </AnimatePresence>

          {/* Frame controls, present only on hover or focus. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="pointer-events-auto grid h-12 w-12 place-items-center bg-alabaster/85 text-ink backdrop-blur transition-colors duration-300 hover:bg-alabaster"
            >
              <ArrowLeft size={17} strokeWidth={1.3} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="pointer-events-auto grid h-12 w-12 place-items-center bg-alabaster/85 text-ink backdrop-blur transition-colors duration-300 hover:bg-alabaster"
            >
              <ArrowRight size={17} strokeWidth={1.3} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="View image full size"
            className="absolute bottom-5 right-5 grid h-12 w-12 place-items-center bg-alabaster/85 text-ink opacity-0 backdrop-blur transition-[opacity,background-color] duration-500 hover:bg-alabaster group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <Expand size={16} strokeWidth={1.3} />
          </button>

          <p className="absolute left-5 top-5 label bg-alabaster/85 px-2.5 py-1.5 text-ink backdrop-blur" data-numeric>
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
        </motion.div>

        <div className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${img.kind} frame`}
              aria-current={i === index}
              className={cn(
                "group/thumb relative flex-1 overflow-hidden transition-opacity duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                i === index ? "opacity-100" : "opacity-50 hover:opacity-80",
              )}
            >
              <Media
                src={img.src}
                alt=""
                width={img.width}
                height={img.height}
                aspect="aspect-[4/5]"
                sizes="140px"
                curtain={false}
                grain={false}
                imgClassName={cn(
                  "transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/thumb:scale-[1.06]",
                  img.kind === "elevation" ? "object-contain p-2 bg-ivory" : undefined,
                )}
                quality={52}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  i === index ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-small text-mist">{active.alt}</p>
      </div>

      {/* -------------------------------------------------------- lightbox */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-[140] bg-ink/96"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} — ${active.alt}`}
          >
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Close full size view"
              className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center text-alabaster/75 transition-colors hover:text-alabaster"
            >
              <X size={20} strokeWidth={1.3} />
            </button>
            <div className="flex h-full items-center justify-center p-6 sm:p-12">
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative h-full w-full"
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="object-contain"
                />
              </motion.div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-7 p-6">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="label text-alabaster/72 transition-colors hover:text-alabaster"
              >
                Previous
              </button>
              <span className="label text-alabaster/60" data-numeric>
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="label text-alabaster/72 transition-colors hover:text-alabaster"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
