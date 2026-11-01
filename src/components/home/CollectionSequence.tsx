import Link from "next/link";
import { collections, collectionProducts, type Collection } from "@/data/collections";
import { designerById } from "@/data/brand";
import { materialMap } from "@/data/materials";
import { Media } from "@/components/ui/Media";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

/**
 * Five collections, four layouts, no repeated composition. Each collection is
 * art-directed to its own photography rather than poured into a card grid:
 * Sestri gets a full-bleed plate, Alvara a wide offset, Kelvara an overlapping
 * pair, Noctis a diptych, Oriel a tall portrait with the copy alongside.
 */
export function CollectionSequence() {
  return (
    <section aria-labelledby="collections-heading" className="bg-ivory">
      <div className="gutter pt-[var(--spacing-section)]">
        <div className="flex flex-col gap-7 pb-12 md:flex-row md:items-end md:justify-between md:gap-16">
          <div className="max-w-[44rem]">
            <Eyebrow index="01">Collections</Eyebrow>
            <h2 id="collections-heading" className="mt-6 font-display text-display text-ink">
              <SplitText>Five families, each resolved around one idea.</SplitText>
            </h2>
          </div>
          <Reveal delay={200} className="shrink-0 md:pb-3">
            <Link href="/collections" className="link-draw label-lg text-ink">
              All five collections
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="flex flex-col">
        {collections.map((c) => (
          <Layout key={c.id} collection={c} />
        ))}
      </div>
    </section>
  );
}

function Layout({ collection }: { collection: Collection }) {
  switch (collection.layout) {
    case "full":
      return <FullPlate c={collection} />;
    case "offset-right":
      return <WideOffset c={collection} flip={collection.id === "oriel"} />;
    case "offset-left":
      return <OverlapPair c={collection} />;
    case "pair":
      return <Diptych c={collection} />;
  }
}

/* ------------------------------------------------------------------ meta -- */

function Meta({ c, tone = "ink" }: { c: Collection; tone?: "ink" | "light" }) {
  const designer = designerById(c.designer);
  const count = collectionProducts(c.id).length;
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-9 gap-y-3",
        tone === "light" ? "text-alabaster/60" : "text-mist",
      )}
    >
      <div>
        <dt className="label">Designer</dt>
        <dd className={cn("label mt-1", tone === "light" ? "text-alabaster/90" : "text-smoke")}>
          {designer?.name}
        </dd>
      </div>
      <div>
        <dt className="label">Introduced</dt>
        <dd
          className={cn("label mt-1", tone === "light" ? "text-alabaster/90" : "text-smoke")}
          data-numeric
        >
          {c.year}
        </dd>
      </div>
      <div>
        <dt className="label">Pieces</dt>
        <dd
          className={cn("label mt-1", tone === "light" ? "text-alabaster/90" : "text-smoke")}
          data-numeric
        >
          {String(count).padStart(2, "0")}
        </dd>
      </div>
    </dl>
  );
}

function MaterialStrip({ c }: { c: Collection }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
  );
}

function ViewLink({ c, tone = "ink" }: { c: Collection; tone?: "ink" | "light" }) {
  return (
    <span
      className={cn(
        "link-draw label-lg inline-block",
        tone === "light" ? "text-alabaster" : "text-ink",
      )}
    >
      View {c.name}
    </span>
  );
}

/* --------------------------------------------------------------- layouts -- */

/** Full-bleed plate, copy laid over the lower third. Sestri. */
function FullPlate({ c }: { c: Collection }) {
  return (
    <article className="relative mt-[var(--spacing-section)]">
      <Link
        href={`/collections/${c.id}`}
        className="group block"
        data-cursor={`View ${c.name}`}
      >
        <Parallax amount={0.07} className="h-[78svh] min-h-[28rem] bg-ink">
          <Media
            src={c.images.hero.src}
            alt={c.images.hero.alt}
            width={c.images.hero.width}
            height={c.images.hero.height}
            className="h-full"
            imgClassName="h-full"
            sizes="100vw"
            curtain={false}
            quality={80}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,14,11,0.72)_0%,rgba(16,14,11,0.18)_42%,rgba(16,14,11,0)_70%)]"
          />
        </Parallax>

        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="gutter pb-[clamp(2rem,4vw,3.5rem)]">
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Eyebrow index={c.index} tone="light">
                  Collection
                </Eyebrow>
                <h3 className="mt-5 font-display text-title text-alabaster">
                  {c.name}
                  <span className="text-alabaster/50"> — {c.strapline}</span>
                </h3>
                <p className="editorial mt-4 max-w-[30rem] text-alabaster/75">{c.summary}</p>
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <Meta c={c} tone="light" />
                <div className="mt-7">
                  <ViewLink c={c} tone="light" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** A wide frame set off-centre, copy in the short column. Alvara, Oriel. */
function WideOffset({ c, flip }: { c: Collection; flip?: boolean }) {
  return (
    <article className="gutter mt-[var(--spacing-section)]">
      <Link href={`/collections/${c.id}`} className="group block">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className={cn("lg:col-span-8", flip ? "lg:order-2 lg:col-start-5" : "")}>
            <Media
              src={flip ? c.images.plate.src : c.images.hero.src}
              alt={flip ? c.images.plate.alt : c.images.hero.alt}
              width={flip ? c.images.plate.width : c.images.hero.width}
              height={flip ? c.images.plate.height : c.images.hero.height}
              aspect={flip ? "aspect-[4/5]" : "aspect-[16/10]"}
              sizes="(min-width:1024px) 62vw, 100vw"
              hoverZoom
            />
          </div>

          <div
            className={cn(
              "flex flex-col justify-end lg:col-span-3",
              flip ? "lg:order-1 lg:col-start-1 lg:justify-start lg:pt-6" : "lg:col-start-10",
            )}
          >
            <Reveal>
              <Eyebrow index={c.index}>Collection</Eyebrow>
              <h3 className="mt-5 font-display text-title text-ink">{c.name}</h3>
              <p className="label mt-3 text-smoke">{c.strapline}</p>
              <p className="editorial mt-6 text-smoke">{c.summary}</p>
              <div className="mt-8">
                <MaterialStrip c={c} />
              </div>
              <div className="mt-8">
                <Meta c={c} />
              </div>
              <div className="mt-8">
                <ViewLink c={c} />
              </div>
            </Reveal>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** A tall plate with a detail overlapping its lower corner. Kelvara. */
function OverlapPair({ c }: { c: Collection }) {
  return (
    <article className="gutter mt-[var(--spacing-section)]">
      <Link href={`/collections/${c.id}`} className="group block">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-4 lg:pr-6">
            <Reveal>
              <Eyebrow index={c.index}>Collection</Eyebrow>
              <h3 className="mt-5 font-display text-title text-ink">{c.name}</h3>
              <p className="label mt-3 text-smoke">{c.strapline}</p>
              <p className="editorial mt-6 text-smoke">{c.description[0]}</p>
              <div className="mt-8">
                <Meta c={c} />
              </div>
              <div className="mt-8">
                <ViewLink c={c} />
              </div>
            </Reveal>
          </div>

          <div className="relative lg:col-span-7 lg:col-start-6">
            <Media
              src={c.images.plate.src}
              alt={c.images.plate.alt}
              width={c.images.plate.width}
              height={c.images.plate.height}
              aspect="aspect-[4/5]"
              sizes="(min-width:1024px) 54vw, 100vw"
              hoverZoom
            />
            <div className="relative -mt-16 ml-auto w-[58%] sm:w-[46%] lg:absolute lg:-bottom-14 lg:-left-20 lg:mt-0 lg:w-[38%]">
              <Media
                src={c.images.detail.src}
                alt={c.images.detail.alt}
                width={c.images.detail.width}
                height={c.images.detail.height}
                aspect="aspect-[4/3]"
                sizes="(min-width:1024px) 22vw, 50vw"
                delay={180}
                className="shadow-[0_24px_70px_rgba(24,21,16,0.18)]"
              />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Two unequal frames, copy between them. Noctis. */
function Diptych({ c }: { c: Collection }) {
  return (
    <article className="gutter mt-[var(--spacing-section)] lg:mt-[calc(var(--spacing-section)+4rem)]">
      <Link href={`/collections/${c.id}`} className="group block">
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Media
              src={c.images.plate.src}
              alt={c.images.plate.alt}
              width={c.images.plate.width}
              height={c.images.plate.height}
              aspect="aspect-[4/5]"
              sizes="(min-width:1024px) 38vw, 100vw"
              hoverZoom
            />
          </div>

          <div className="lg:col-span-3 lg:pt-20">
            <Reveal>
              <Eyebrow index={c.index}>Collection</Eyebrow>
              <h3 className="mt-5 font-display text-title text-ink">{c.name}</h3>
              <p className="label mt-3 text-smoke">{c.strapline}</p>
              <p className="editorial mt-6 text-smoke">{c.summary}</p>
              <div className="mt-8">
                <MaterialStrip c={c} />
              </div>
              <div className="mt-8">
                <ViewLink c={c} />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:pt-40">
            <Media
              src={c.images.hero.src}
              alt={c.images.hero.alt}
              width={c.images.hero.width}
              height={c.images.hero.height}
              aspect="aspect-[5/4]"
              sizes="(min-width:1024px) 30vw, 100vw"
              delay={140}
              hoverZoom
            />
            <p className="label mt-4 text-mist">{c.images.detail.alt}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
