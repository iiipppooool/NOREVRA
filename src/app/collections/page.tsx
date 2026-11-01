import type { Metadata } from "next";
import Link from "next/link";
import { collections, collectionProducts } from "@/data/collections";
import { designerById, brand } from "@/data/brand";
import { materialMap } from "@/data/materials";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Collections",
  description: `The five ${brand.name} collections — Sestri, Alvara, Kelvara, Noctis and Oriel — each resolved around a single idea and designed by one hand.`,
  path: "/collections",
});

export default function CollectionsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Collections", path: "/collections" },
        ])}
      />

      <Masthead
        eyebrow="Collections"
        title="Five families, one method."
        lede="A collection is not a style here. Each one begins with a single decision — a seat height, a rule about joints, a thickness of headboard — and everything else follows from it."
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <ol className="rule-t">
          {collections.map((c, i) => {
            const designer = designerById(c.designer);
            const count = collectionProducts(c.id).length;
            const flip = i % 2 === 1;
            return (
              <li key={c.id} className="rule-b">
                <Link
                  href={`/collections/${c.id}`}
                  className="group grid grid-cols-1 items-center gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-7 py-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12"
                >
                  <div
                    className={cn(
                      "lg:col-span-5",
                      flip ? "lg:order-2 lg:col-start-8" : "",
                    )}
                  >
                    <Media
                      src={flip ? c.images.plate.src : c.images.hero.src}
                      alt={flip ? c.images.plate.alt : c.images.hero.alt}
                      width={flip ? c.images.plate.width : c.images.hero.width}
                      height={flip ? c.images.plate.height : c.images.hero.height}
                      aspect={flip ? "aspect-[4/5]" : "aspect-[16/11]"}
                      sizes="(min-width:1024px) 40vw, 100vw"
                      hoverZoom
                      quality={76}
                    />
                  </div>

                  <div className={cn("lg:col-span-6", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-7")}>
                    <Reveal>
                      <Eyebrow index={c.index}>Collection</Eyebrow>
                      <h2 className="mt-5 font-display text-title text-ink transition-colors duration-500 group-hover:text-graphite">
                        {c.name}
                        <span className="text-mist"> — {c.strapline}</span>
                      </h2>
                      <p className="editorial mt-5 max-w-[34rem] text-smoke">{c.summary}</p>

                      <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                        {c.materialIds.map((id) => {
                          const m = materialMap[id];
                          if (!m) return null;
                          return (
                            <li key={id} className="flex items-center gap-2.5">
                              <span
                                aria-hidden
                                className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/10"
                                style={{ backgroundColor: m.hex }}
                              />
                              <span className="label text-smoke">{m.name}</span>
                            </li>
                          );
                        })}
                      </ul>

                      <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-3">
                        <div>
                          <dt className="label text-mist">Designer</dt>
                          <dd className="label mt-1 text-smoke">{designer?.name}</dd>
                        </div>
                        <div>
                          <dt className="label text-mist">Introduced</dt>
                          <dd className="label mt-1 text-smoke" data-numeric>
                            {c.year}
                          </dd>
                        </div>
                        <div>
                          <dt className="label text-mist">Pieces</dt>
                          <dd className="label mt-1 text-smoke" data-numeric>
                            {String(count).padStart(2, "0")}
                          </dd>
                        </div>
                      </dl>

                      <span className="link-draw label-lg mt-8 inline-block text-ink">
                        View {c.name}
                      </span>
                    </Reveal>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
