import Link from "next/link";
import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

/**
 * Six pieces in a three-column grid with the middle column dropped, so the
 * eye moves diagonally rather than in rows. Not a uniform card grid.
 */
export function FeaturedProducts() {
  const items = featuredProducts();

  return (
    <section
      aria-labelledby="featured-heading"
      className="gutter bg-ivory pt-[var(--spacing-section)]"
    >
      <div className="flex flex-col gap-7 pb-14 md:flex-row md:items-end md:justify-between md:gap-16">
        <div className="max-w-[40rem]">
          <Eyebrow>Selected pieces</Eyebrow>
          <h2 id="featured-heading" className="mt-6 font-display text-display text-ink">
            <SplitText>Asked for most</SplitText>
          </h2>
        </div>
        <Reveal variant="copy" delay={180} className="shrink-0 md:pb-3">
          <Link href="/furniture" className="link-draw label-lg text-ink">
            All twenty pieces
          </Link>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-y-14 md:grid-cols-3 md:gap-x-7 lg:gap-x-10 lg:gap-y-20">
        {items.map((p, i) => (
          <Reveal key={p.slug} variant="settle" delay={(i % 3) * 110} className={cn(i % 3 === 1 && "md:mt-[5.5rem]")}>
            <ProductCard product={p} sizes="(min-width:768px) 31vw, (min-width:640px) 46vw, 92vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
