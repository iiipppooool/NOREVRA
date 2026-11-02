import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/data/brand";
import { siteAssets } from "@/data/assets";
import { materials, familyLabels, type MaterialFamily } from "@/data/materials";
import { collections } from "@/data/collections";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { Media } from "@/components/ui/Media";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink, TextLink } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Our Story",
  description: `${brand.name} is a new furniture house. Twenty pieces, drawn in-house and made to order, from a library of eighteen materials. The catalogue opened in November 2026.`,
  path: "/our-story",
  image: {
    src: siteAssets.storyHero.src,
    width: siteAssets.storyHero.width,
    height: siteAssets.storyHero.height,
    alt: siteAssets.storyHero.alt,
  },
});

/**
 * A new house has no history, so this is a statement of position and of
 * what has not been done yet — which is more useful to a buyer than an
 * invented timeline, and is the only version of it that is true.
 */
const chapters = [
  {
    year: "What this is",
    title: "A new furniture house",
    body: [
      "Norevra opened its catalogue in November 2026. Twenty pieces across five families, drawn in-house, made to order. There is no back catalogue, no archive and no thirty-year story, and we would rather say so than invent one.",
      "What there is: a position on how furniture should be built, a short library of materials chosen for how they age, and a set of drawings exact enough to cut from.",
    ],
  },
  {
    year: "The method",
    title: "Decided before it is drawn",
    body: [
      "Each family begins with one decision and follows it. A seat height of thirty-eight centimetres. A rule that nothing may be joined by anything but gravity and a dowel. A cabinet opened by a rebate rather than a handle. Once the decision is made, most of the rest is determined.",
      "That is why the collections do not look like each other. There is no signature leg, no recurring curve and no detail repeated so you can recognise us across a room. What they share is the method, not a style.",
    ],
  },
  {
    year: "How it is made",
    title: "Solid, and repairable",
    body: [
      "Solid timber throughout — no veneer on any surface you can see or touch. Carcasses housed and glued rather than screwed. Drawers cut by hand. Seats on elasticated webbing that can be re-tensioned with a staple gun and an afternoon.",
      "Every cover comes off. Every cushion can be refilled, every top refinished, every mechanism replaced. We guarantee frames and structural joinery for ten years from first delivery, which is a commitment rather than a record, because there has not been ten years yet.",
    ],
  },
  {
    year: "Not yet",
    title: "What we have not done",
    body: [
      "We have no showroom open to the street, so seeing a piece means writing first and arranging a time. We have no customer list, no press cuttings and no completed projects to show you, because the catalogue is days old.",
      "Every piece you order from this catalogue is being made for the first time. We think that is worth knowing before you spend this kind of money, and we would rather you heard it from us.",
    ],
  },
];

const byFamily = (Object.keys(familyLabels) as MaterialFamily[]).map((f) => ({
  family: f,
  label: familyLabels[f],
  items: materials.filter((m) => m.family === f),
}));

export default function StoryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Our Story", path: "/our-story" },
        ])}
      />

      <Masthead
        eyebrow="The house"
        title="Everything here is being made for the first time"
        lede={brand.summary}
      />

      <Parallax amount={0.08} className="h-[62svh] min-h-[22rem] bg-ink">
        <Media
          src={siteAssets.storyHero.src}
          alt={siteAssets.storyHero.alt}
          width={siteAssets.storyHero.width}
          height={siteAssets.storyHero.height}
          className="h-full"
          imgClassName="h-full"
          sizes="100vw"
          priority
          curtain={false}
          quality={80}
        />
      </Parallax>

      {/* Chapters */}
      <section aria-labelledby="chapters-heading" className="gutter py-[clamp(4rem,8vw,7rem)]">
        <h2 id="chapters-heading" className="sr-only">
          History
        </h2>
        <ol className="rule-t">
          {chapters.map((ch, i) => (
            <Reveal as="li" key={ch.year} delay={i * 60} className="rule-b py-[clamp(2rem,4vw,3.5rem)]">
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <p className="label text-mist">{ch.year}</p>
                </div>
                <div className="lg:col-span-8 lg:col-start-5">
                  <h3 className="font-display text-title text-ink">{ch.title}</h3>
                  <div className="mt-5 space-y-4">
                    {ch.body.map((p, j) => (
                      <p key={j} className={j === 0 ? "editorial text-smoke" : "text-body text-smoke"}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* The position on imagery */}
      <section id="drawn" className="gutter scroll-mt-28 pb-[clamp(3.5rem,7vw,6rem)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 rule-t pt-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Imagery</Eyebrow>
            <h2 className="mt-5 max-w-[16rem] font-display text-title text-ink">
              {brand.drawing.title}
            </h2>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="max-w-[38rem] space-y-5">
              {brand.drawing.body.map((para, i) => (
                <Reveal key={i} variant="copy" delay={i * 70}>
                  <p className={i === 0 ? "editorial text-ink" : "text-body text-smoke"}>{para}</p>
                </Reveal>
              ))}
            </div>

            <Reveal variant="copy" delay={280} className="mt-9 border-l border-hairline pl-6">
              <p className="max-w-[34rem] text-small text-smoke">{brand.drawing.request}</p>
              <div className="mt-5">
                <TextLink href="/contact?topic=Photographs+of+a+piece#enquiry">
                  Request photographs
                </TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section id="materials" className="bg-ink text-alabaster">
        <div className="gutter py-[clamp(4rem,8vw,7rem)]">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow tone="light">Materials</Eyebrow>
              <h2 className="mt-6 max-w-[20rem] font-display text-display text-alabaster">
                Eighteen materials, and no more.
              </h2>
              <p className="editorial mt-8 max-w-[26rem] text-alabaster/70">
                The library is deliberately short. Every material in it has been specified for at
                least two years, is available in quantity from one source, and will hold its
                appearance for twenty years in a domestic room.
              </p>
              <p className="mt-6 max-w-[26rem] text-small text-alabaster/68">
                Samples are sent free, anywhere, in a box of up to eight. A finish you cannot see in
                your own light is a finish you have not chosen.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/contact#samples" variant="light">
                  Request samples
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Media
                src={siteAssets.storyMaterials.src}
                alt={siteAssets.storyMaterials.alt}
                width={siteAssets.storyMaterials.width}
                height={siteAssets.storyMaterials.height}
                aspect="aspect-[4/5]"
                sizes="(min-width:1024px) 48vw, 100vw"
                quality={80}
              />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 border-t border-alabaster/15 pt-12 sm:grid-cols-2 lg:grid-cols-5">
            {byFamily.map((group, i) => (
              <Reveal key={group.family} delay={i * 60}>
                <h3 className="label text-alabaster/62">{group.label}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((m) => (
                    <li key={m.id} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1 h-3.5 w-3.5 shrink-0 ring-1 ring-alabaster/20"
                        style={{ backgroundColor: m.hex }}
                      />
                      <span>
                        <span className="label-lg block text-alabaster/90">{m.name}</span>
                        <span className="label mt-0.5 block text-alabaster/60">{m.origin}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop */}
      <section className="gutter py-[clamp(4rem,8vw,7rem)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Media
              src={siteAssets.storyWorkshop.src}
              alt={siteAssets.storyWorkshop.alt}
              width={siteAssets.storyWorkshop.width}
              height={siteAssets.storyWorkshop.height}
              aspect="aspect-[16/10]"
              sizes="(min-width:1024px) 56vw, 100vw"
              quality={78}
            />
          </div>
          <Reveal delay={120} className="flex flex-col justify-center lg:col-span-4 lg:col-start-9">
            <Eyebrow>The workshop</Eyebrow>
            <h2 className="mt-5 font-display text-title text-ink">Where it is actually made</h2>
            <p className="editorial mt-6 text-smoke">
              Everything is cut, assembled, upholstered and finished in one building in Meda. There
              is no second factory and no outsourced upholstery.
            </p>
            <p className="mt-5 text-small text-smoke">
              A joiner spends two years on Kelvara casegoods before being allowed near an Alvara
              table. It is not a hierarchy; stone is simply unforgiving in a way that timber is not.
            </p>
            <div className="mt-8">
              <TextLink href="/journal">Read the journal</TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* People */}
      <section aria-labelledby="people-heading" className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
        <Eyebrow>Designers</Eyebrow>
        <h2 id="people-heading" className="mt-5 font-display text-title text-ink">
          Drawn in-house
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
          {brand.designers.map((d, i) => {
            const theirs = collections.filter((c) => c.designer === d.id);
            return (
              <Reveal as="li" key={d.id} delay={i * 70} className="rule-t pt-7">
                <h3 className="font-display text-heading text-ink">{d.name}</h3>
                <p className="label mt-2 text-mist">{d.role}</p>
                <p className="mt-4 text-small text-smoke">{d.bio}</p>
                {theirs.length > 0 && (
                  <p className="label mt-5 text-mist">
                    {theirs.map((c, j) => (
                      <span key={c.id}>
                        {j > 0 && " · "}
                        <Link href={`/collections/${c.id}`} className="link-draw text-smoke">
                          {c.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* Where we are */}
      <section aria-labelledby="where-heading" className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
        <Eyebrow>Addresses</Eyebrow>
        <h2 id="where-heading" className="mt-5 font-display text-title text-ink">
          Where to find us
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {brand.locations.map((loc, i) => (
            <Reveal as="li" key={loc.id} delay={i * 70} className="rule-t pt-7">
              <p className="label text-mist">{loc.label}</p>
              <h3 className="mt-2 font-display text-heading text-ink">{loc.city}</h3>
              <address className="mt-4 text-small not-italic text-smoke">
                {loc.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
              <div className="mt-4 space-y-1">
                {loc.hours.map((h) => (
                  <p key={h} className="label text-mist">
                    {h}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-small text-smoke">{loc.note}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/contact" variant="solid">
            Book an appointment
          </ButtonLink>
          <ButtonLink href="/furniture" variant="outline">
            See the catalogue
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
