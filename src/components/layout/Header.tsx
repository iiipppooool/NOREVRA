"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { brand } from "@/data/brand";
import { primaryNav } from "@/data/navigation";
import { collections } from "@/data/collections";
import { categories } from "@/data/types";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useChrome } from "./Chrome";
import { MobileNav } from "./MobileNav";
import { Media } from "@/components/ui/Media";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const pathname = usePathname();
  const { overHero } = useChrome();
  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const openBag = useStore((s) => s.openBag);
  const wishlist = useStore((s) => s.wishlist);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Retract when travelling down, return the moment they reverse.
      setHidden(y > 420 && y > lastY.current + 4);
      lastY.current = y;
    };
    // Read the initial position on the next frame rather than synchronously:
    // a reload part-way down the page still gets the solid header, without
    // forcing a second render pass during the effect.
    const first = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Navigating closes the flyout and the mobile panel. Adjusted during render
  // on a path change rather than in an effect, so the new route never paints
  // for a frame with the old menu still open.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
    setMenu(false);
  }

  const count = hydrated ? lines.reduce((n, l) => n + l.qty, 0) : 0;
  const wished = hydrated ? wishlist.length : 0;
  const transparent = overHero && !scrolled && !panel;

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-5 focus:py-3 focus:label focus:text-alabaster"
      >
        Skip to content
      </a>

      <header
        onMouseLeave={scheduleClose}
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !panel ? "-translate-y-full" : "translate-y-0",
        )}
      >
        {/* The surface. Fades rather than snapping, and carries a hairline. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b transition-[opacity,background-color,border-color] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            transparent
              ? "border-transparent bg-transparent"
              : "border-hairline/70 bg-ivory/92 backdrop-blur-xl",
          )}
        />

        <div className="relative gutter">
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              scrolled ? "h-[4.5rem]" : "h-[5.75rem] md:h-[6.75rem]",
            )}
          >
            {/* Wordmark */}
            <Link
              href="/"
              aria-label={`${brand.name} — home`}
              className={cn(
                "wordmark shrink-0 text-[0.8125rem] transition-colors duration-500 md:text-[0.9375rem]",
                transparent ? "text-alabaster" : "text-ink",
              )}
            >
              {brand.wordmark}
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-10">
                {primaryNav.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onMouseEnter={() => {
                          cancelClose();
                          setPanel(item.panel ?? null);
                        }}
                        onFocus={() => setPanel(item.panel ?? null)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "label relative block py-2 transition-colors duration-500",
                          transparent
                            ? "text-alabaster/80 hover:text-alabaster"
                            : "text-smoke hover:text-ink",
                          active && (transparent ? "text-alabaster" : "text-ink"),
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                            active || panel === item.panel ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Utilities */}
            <div className="flex items-center gap-5 md:gap-7">
              <Link
                href="/wishlist"
                className={cn(
                  "label hidden transition-colors duration-500 sm:block",
                  transparent ? "text-alabaster/80 hover:text-alabaster" : "text-smoke hover:text-ink",
                )}
              >
                Saved
                <span className="tabular-nums" data-numeric suppressHydrationWarning>
                  {wished > 0 ? ` (${wished})` : ""}
                </span>
              </Link>

              <button
                type="button"
                onClick={openBag}
                className={cn(
                  "label transition-colors duration-500",
                  transparent ? "text-alabaster hover:text-alabaster/70" : "text-ink hover:text-smoke",
                )}
                aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
              >
                Bag
                <span className="tabular-nums" data-numeric suppressHydrationWarning>
                  {" "}
                  ({count})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMenu(true)}
                className={cn(
                  "label -mr-1 flex h-10 items-center gap-2.5 transition-colors duration-500 lg:hidden",
                  transparent ? "text-alabaster" : "text-ink",
                )}
                aria-label="Open menu"
                aria-expanded={menu}
              >
                <span aria-hidden className="flex w-5 flex-col gap-[5px]">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-full bg-current" />
                </span>
                Menu
              </button>
            </div>
          </div>
        </div>

        {/* Flyout */}
        <AnimatePresence>
          {panel && (
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
              onMouseEnter={cancelClose}
              className="absolute inset-x-0 top-full hidden border-b border-hairline/70 bg-ivory/97 backdrop-blur-xl lg:block"
            >
              <div className="gutter py-10">
                {panel === "collections" ? <CollectionsPanel /> : <FurniturePanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileNav open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

function CollectionsPanel() {
  return (
    <div className="grid grid-cols-5 gap-6">
      {collections.map((c) => (
        <Link key={c.id} href={`/collections/${c.id}`} className="group block">
          <Media
            src={c.images.plate.src}
            alt={c.images.plate.alt}
            width={c.images.plate.width}
            height={c.images.plate.height}
            aspect="aspect-[4/5]"
            sizes="18vw"
            curtain={false}
            hoverZoom
            quality={62}
          />
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <span className="font-display text-[1.25rem] text-ink">{c.name}</span>
            <span className="label text-mist" data-numeric>
              {c.index}
            </span>
          </div>
          <p className="label mt-1 text-smoke">{c.strapline}</p>
        </Link>
      ))}
    </div>
  );
}

function FurniturePanel() {
  const newest = products.filter((p) => p.isNew).slice(0, 2);
  return (
    <div className="grid grid-cols-12 gap-12">
      <div className="col-span-3">
        <p className="label mb-6 text-mist">Typology</p>
        <ul className="space-y-3.5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/furniture?category=${c.id}`}
                prefetch={false}
                className="link-draw font-display text-[1.375rem] text-ink"
              >
                {c.plural}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-3">
        <p className="label mb-6 text-mist">Collection</p>
        <ul className="space-y-3.5">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/furniture?collection=${c.id}`}
                prefetch={false}
                className="link-draw font-display text-[1.375rem] text-ink"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-6">
        <p className="label mb-6 text-mist">Recently added</p>
        <div className="grid grid-cols-2 gap-6">
          {newest.map((p) => (
            <Link key={p.slug} href={`/furniture/${p.slug}`} className="group flex gap-5">
              <Media
                src={p.images[0].src}
                alt={p.images[0].alt}
                width={p.images[0].width}
                height={p.images[0].height}
                aspect="aspect-[4/5]"
                className="w-28 shrink-0"
                sizes="112px"
                curtain={false}
                hoverZoom
                quality={60}
              />
              <div>
                <p className="label text-mist">{p.typology}</p>
                <p className="mt-1.5 font-display text-[1.375rem] text-ink">{p.name}</p>
                <p className="mt-2 max-w-[18rem] text-small text-smoke">{p.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
