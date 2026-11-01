import type { Metadata } from "next";
import { brand } from "@/data/brand";
import { products } from "@/data/products";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import {
  parseQuery,
  queryProducts,
  facetGroups,
  queryDescription,
  activeFilterCount,
} from "@/lib/catalogue";
import { Masthead } from "@/components/ui/Masthead";
import { Filters } from "@/components/shop/Filters";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildMetadata({
  title: "Furniture",
  description: `The complete ${brand.name} catalogue: ${products.length} pieces in seating, tables, storage, beds, lighting and objects. Made to order in Brianza.`,
  path: "/furniture",
});

export default async function FurniturePage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = parseQuery(sp);
  const results = queryProducts(query);
  const groups = facetGroups(query);
  const description = queryDescription(query);
  const filtered = activeFilterCount(query) > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Furniture", path: "/furniture" },
        ])}
      />

      <Masthead
        eyebrow="Catalogue"
        title="Twenty pieces, made to order."
        lede={`Every piece is built after it is ordered, in our workshop in Meda. Choose a size and a finish; the lead time shown is the time it takes us to make it.`}
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <Filters query={query} groups={groups} total={results.length}>
          {description && (
            <p className="label pb-7 text-mist">
              Showing {results.length} {results.length === 1 ? "piece" : "pieces"} — {description}
            </p>
          )}

          {results.length === 0 ? (
            <div className="rule-t py-20 text-center">
              <p className="editorial text-smoke">Nothing in the catalogue matches that.</p>
              <p className="mx-auto mt-4 max-w-[26rem] text-small text-mist">
                Twenty pieces is a small catalogue. Try removing a filter, or tell us what you are
                looking for — we take bespoke commissions.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/furniture" variant="outline">
                  Clear filters
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" className="h-12 px-4">
                  Make an enquiry
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-7 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {results.map((p, i) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  priority={i < 3}
                  reveal={(i % 3) * 80}
                  sizes="(min-width:1024px) 27vw, (min-width:768px) 44vw, 46vw"
                />
              ))}
            </div>
          )}

          {!filtered && (
            <div className="rule-t mt-20 pt-10">
              <p className="editorial max-w-[38rem] text-smoke">
                Looking for a length, a height or a finish that is not listed? Most of what we make
                has been adjusted for a particular room at some point.
              </p>
              <div className="mt-7">
                <ButtonLink href="/contact#trade" variant="outline">
                  Discuss a specification
                </ButtonLink>
              </div>
            </div>
          )}
        </Filters>
      </div>
    </>
  );
}
