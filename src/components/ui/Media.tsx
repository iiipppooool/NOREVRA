"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { observe } from "@/lib/observe";
import { cn } from "@/lib/utils";
import focusMap from "@/data/focus.json";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Tailwind aspect utility, e.g. "aspect-[4/5]". Omit to use intrinsic. */
  aspect?: string;
  className?: string;
  imgClassName?: string;
  sizes: string;
  priority?: boolean;
  /** Wipe the image in from the bottom as it enters the viewport. */
  curtain?: boolean;
  delay?: number;
  /** Scale on hover. Used in grids, not in editorial layouts. */
  hoverZoom?: boolean;
  grain?: boolean;
  quality?: number;
  /**
   * Where to hold the crop. Defaults to the subject's recorded position: the
   * asset pipeline measures exactly where the piece sits in each frame and
   * writes it to src/data/focus.json, so a wide plate squeezed into a tall
   * box on a phone keeps the furniture rather than the empty wall.
   */
  focus?: string;
};

/**
 * Every photograph on the site goes through here, so grain, reveal behaviour
 * and loading strategy are uniform. The grain overlay is what keeps generated
 * art direction and real photography sitting in the same world.
 */
export function Media({
  src,
  alt,
  width,
  height,
  aspect,
  className,
  imgClassName,
  sizes,
  priority,
  curtain = true,
  delay = 0,
  hoverZoom = false,
  grain = true,
  quality = 78,
  focus,
}: Props) {
  const objectPosition =
    focus ?? (focusMap as Record<string, string>)[src] ?? "center 62%";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!curtain) return;
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-curtain", "in");
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95 && r.bottom > 0) {
      requestAnimationFrame(show);
      return;
    }
    return observe(el, (e) => e.isIntersecting && show());
  }, [curtain]);

  return (
    <div
      ref={ref}
      {...(curtain ? { "data-curtain": "out" } : {})}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(
        "relative overflow-hidden bg-limestone",
        grain && "grain",
        aspect,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        style={{ objectPosition }}
        className={cn(
          "h-full w-full object-cover",
          hoverZoom &&
            "transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]",
          imgClassName,
        )}
      />
    </div>
  );
}
