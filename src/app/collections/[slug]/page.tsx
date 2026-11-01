import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { collections, collectionById, collectionProducts } from "@/data/collections";
import { designerById } from "@/data/brand";
import { materialMap, familyLabels } from "@/data/materials";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCard } from "@/components/product/ProductCard";
import { OverHero } from "@/components/layout/Chrome";
import { ButtonLink } from "@/components/ui/Button";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionById(slug);
  if (!c) return { title: "Not found" };
  return buildMetadata({
    title: `${c.name} — ${c.strapline}`,
    description: c.summary,
    path: `/collections/${c.id}`,
    image: {
      src: c.images.hero.src,
      width: c.images.hero.width,
      height: c.images.hero.height,
      alt: c.images.hero.alt,
    },
  });
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params;
  const c = collectionById(slug);
  if (!c) notFound();

  const items = collectionProducts(c.id);
  const designer = designerById(c.designer);
  const others = collections.filter((x) => x.id !== c.id);

  const trail = [
    { name: "Collections", path: "/collections" },
    { name: c.name, path: `/collections/${c.id}` },
  ];

  return (
    <>
      <OverHero />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, ...trail])} />

      {/* Opening plate */}
      <section
        aria-label={`${c.name} collection`}
        data-cursor="Scroll"
        className="relative isolate flex h-[82svh] min-h-[30rem] flex-col justify-end overflow-hidden bg-ink"
      >
        <div className="absolute inset-0 -z-10">
          <Media
            src={c.images.hero.src}
            alt={c.images.hero.alt}
            width={c.images.hero.width}
            height={c.images.hero.height}
            className="h-full"
            imgClassName="h-full"
            sizes="100vw"
            priority
            curtain={false}
            quality={82}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,14,11,0.76)_0%,rgba(16,14,11,0.26)_40%,rgba(16,14,11,0.04)_70%,rgba(16,14,11,0.22)_100%)]"
          />
        </div>

        <div data-over-image className="gutter relative pb-[clamp(2.5rem,5vw,4rem)] pt-32">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow index={c.index} tone="light">
                Collection
              </Eyebrow>
              <h1 className="mt-6 font-display text-display text-alabaster">
                <SplitText>{`${c.name} — ${c.strapline}`}</SplitText>
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="editorial text-alabaster/75">{c.summary}</p>
              <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <dt className="label text-alabaster/62">Designer</dt>
                  <dd className="label mt-1 text-alabaster/85">{designer?.name}</dd>
                </div>
                <div>
                  <dt className="label text-alabaster/62">Introduced</dt>
                  <dd className="label mt-1 text-alabaster/85" data-numeric>
                    {c.year}
                  </dd>
                </div>
                <div>
                  <dt className="label text-alabaster/62">Pieces</dt>
                  <dd className="label mt-1 text-alabaster/85" data-numeric>
                    {String(items.length).padStart(2, "0")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="gutter pt-4">
        <Breadcrumb trail={trail} />
      </div>

      {/* The argument */}
      <section className="gutter py-[clamp(3.5rem,7vw,6rem)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {c.description.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <p className={i === 0 ? "editorial text-ink" : "text-body text-smoke"}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={160} className="lg:col-span-4 lg:col-start-9">
            <h2 className="label text-mist">Principal materials</h2>
            <ul className="mt-5 rule-t">
              {c.materialIds.map((id) => {
                const m = materialMap[id];
                if (!m) return null;
                return (
                  <li key={id} className="flex gap-4 rule-b py-4">
                    <span
                      aria-hidden
                      className="mt-1 h-8 w-8 shrink-0 ring-1 ring-ink/10"
                      style={{ backgroundColor: m.hex }}
                    />
                    <span>
                      <span className="label-lg block text-ink">{m.name}</span>
                      <span className="label mt-1 block text-mist">
                        {familyLabels[m.family]} · {m.origin}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* A second plate, offset */}
      <section className="gutter">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Media
              src={c.images.plate.src}
              alt={c.images.plate.alt}
              width={c.images.plate.width}
              height={c.images.plate.height}
              aspect="aspect-[4/5]"
              sizes="(min-width:1024px) 56vw, 100vw"
              quality={78}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-28">
            <Media
              src={c.images.detail.src}
              alt={c.images.detail.alt}
              width={c.images.detail.width}
              height={c.images.detail.height}
              aspect="aspect-[4/3]"
              sizes="(min-width:1024px) 32vw, 100vw"
              delay={140}
              quality={78}
            />
            <p className="label mt-4 text-mist">{c.images.detail.alt}</p>
          </div>
        </div>
      </section>

      {/* The pieces */}
      <section aria-labelledby="pieces-heading" className="gutter py-[clamp(4rem,8vw,7rem)]">
        <div className="flex flex-col gap-6 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>The collection</Eyebrow>
            <h2 id="pieces-heading" className="mt-5 font-display text-title text-ink">
              {items.length} pieces in {c.name}
            </h2>
          </div>
          <Link
            href={`/furniture?collection=${c.id}`}
            prefetch={false}
            className="link-draw label-lg text-ink"
          >
            Open in the catalogue
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4 lg:gap-x-8">
          {items.map((p, i) => (
            <ProductCard
              key={p.slug}
              product={p}
              reveal={(i % 4) * 70}
              showCollection={false}
              sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 46vw"
            />
          ))}
        </div>
      </section>

      {/* Designer */}
      {designer && (
        <section className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Designer</Eyebrow>
              <h2 className="mt-5 font-display text-title text-ink">{designer.name}</h2>
              <p className="label mt-2 text-mist">{designer.role}</p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="editorial text-smoke">{designer.bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* The other four */}
      <section aria-labelledby="others-heading" className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
        <h2 id="others-heading" className="font-display text-title text-ink">
          The other four collections
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-7">
          {others.map((o, i) => (
            <Link key={o.id} href={`/collections/${o.id}`} className="group block">
              <Media
                src={o.images.plate.src}
                alt={o.images.plate.alt}
                width={o.images.plate.width}
                height={o.images.plate.height}
                aspect="aspect-[4/5]"
                sizes="(min-width:768px) 22vw, 46vw"
                delay={i * 70}
                hoverZoom
                quality={66}
              />
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <span className="font-display text-heading text-ink">{o.name}</span>
                <span className="label text-mist" data-numeric>
                  {o.index}
                </span>
              </div>
              <p className="label mt-1.5 text-smoke">{o.strapline}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <ButtonLink href="/furniture" variant="outline">
            The whole catalogue
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
