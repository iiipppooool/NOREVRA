import Link from "next/link";
import { collections } from "@/data/collections";
import { featuredProducts } from "@/data/products";
import { Masthead } from "@/components/ui/Masthead";
import { Media } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  const suggestions = featuredProducts().slice(0, 4);

  return (
    <>
      <Masthead
        eyebrow="404"
        title="That page is not here."
        lede="It may have been moved, or the collection it belonged to may have been reorganised. Everything below still exists."
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/" variant="solid">
            Home
          </ButtonLink>
          <ButtonLink href="/furniture" variant="outline">
            The catalogue
          </ButtonLink>
        </div>

        <nav aria-label="Collections" className="mt-14 rule-t pt-8">
          <Eyebrow>Collections</Eyebrow>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {collections.map((c) => (
              <li key={c.id}>
                <Link href={`/collections/${c.id}`} className="link-draw font-display text-heading text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="nf-suggestions" className="mt-14 rule-t pt-8">
          <Eyebrow>Perhaps</Eyebrow>
          <h2 id="nf-suggestions" className="mt-5 font-display text-title text-ink">
            Pieces we are asked for most
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-7">
            {suggestions.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/furniture/${p.slug}`} className="group block">
                  <Media
                    src={p.images[0].src}
                    alt={p.images[0].alt}
                    width={p.images[0].width}
                    height={p.images[0].height}
                    aspect="aspect-[4/5]"
                    sizes="(min-width:768px) 22vw, 46vw"
                    delay={i * 70}
                    hoverZoom
                    quality={66}
                  />
                  <p className="label mt-4 text-mist">{p.typology}</p>
                  <p className="mt-1 font-display text-heading text-ink">{p.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
