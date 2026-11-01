import { relatedProducts } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function RelatedProducts({ slug, heading = "Specified alongside" }: { slug: string; heading?: string }) {
  const items = relatedProducts(slug);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
      <Eyebrow>Also consider</Eyebrow>
      <h2 id="related-heading" className="mt-5 font-display text-title text-ink">
        {heading}
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
        {items.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={p}
            reveal={i * 80}
            sizes="(min-width:768px) 31vw, 48vw"
          />
        ))}
      </div>
    </section>
  );
}
