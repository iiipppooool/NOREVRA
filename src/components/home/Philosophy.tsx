import { brand } from "@/data/brand";
import { siteAssets } from "@/data/assets";
import { Media } from "@/components/ui/Media";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";

const propositions = [
  {
    n: "i",
    title: "Drawn in elevation",
    body: "A piece is resolved as a front view before it is resolved as an object. It is why our seating sits as low as it does, and why a run of cabinets reads as one plane rather than a row of boxes.",
  },
  {
    n: "ii",
    title: "Solid, not faced",
    body: "No veneer on any surface you can see or touch. Carcasses are housed and glued, drawers are cut by hand, and a joint that will be hidden is finished as though it will not.",
  },
  {
    n: "iii",
    title: "Material before colour",
    body: "We buy stone by the block and cloth by the piece, and we design around what they will give. Nothing in the catalogue is specified in a colour that the material cannot hold for twenty years.",
  },
  {
    n: "iv",
    title: "Made to be repaired",
    body: "Every cover comes off. Every cushion can be refilled, every top refinished, every mechanism replaced. We keep components for pieces we stopped making a decade ago.",
  },
];

export function Philosophy() {
  return (
    <section aria-labelledby="philosophy-heading" className="mt-[var(--spacing-section)] bg-ink text-alabaster">
      {/* A single wide plate, parallaxed, as the section's opening move. */}
      <Parallax amount={0.09} className="h-[52svh] min-h-[20rem]">
        <Media
          src={siteAssets.philosophy.src}
          alt={siteAssets.philosophy.alt}
          width={siteAssets.philosophy.width}
          height={siteAssets.philosophy.height}
          className="h-full"
          imgClassName="h-full"
          sizes="100vw"
          curtain={false}
          quality={78}
        />
        <div aria-hidden className="absolute inset-0 bg-ink/25" />
      </Parallax>

      <div className="gutter py-[clamp(4rem,9vw,8rem)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow tone="light">The house</Eyebrow>
            <h2
              id="philosophy-heading"
              className="mt-6 max-w-[22rem] font-display text-display text-alabaster"
            >
              Four rules, and no house style
            </h2>
            <p className="editorial mt-8 max-w-[26rem] text-alabaster/70">
              Norevra has no signature leg, no recurring curve and no detail we repeat so you can
              recognise us across a room. What the collections share is a method.
            </p>
            <div className="mt-10">
              <ButtonLink href="/our-story" variant="light">
                Read our story
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="border-t border-alabaster/15">
              {propositions.map((p, i) => (
                <Reveal
                  key={p.n}
                  as="li"
                  variant="copy"
                  delay={i * 90}
                  className="border-b border-alabaster/15 py-8"
                >
                  <div className="flex gap-7">
                    <span className="label shrink-0 pt-1.5 text-alabaster/58">{p.n}</span>
                    <div>
                      <h3 className="font-display text-heading text-alabaster">{p.title}</h3>
                      <p className="mt-3 max-w-[34rem] text-body text-alabaster/72">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* A colophon, not a statistics bar. Four numbers set large in a row
            is the most recognisable template pattern there is; the same four
            facts read as a catalogue imprint when they are set as one line. */}
        <Reveal
          variant="copy"
          className="mt-14 flex flex-wrap items-baseline gap-x-7 gap-y-2 border-t border-alabaster/15 pt-7"
        >
          {brand.craft.map((f, i) => (
            <span key={f.label} className="flex items-baseline gap-2.5">
              {i > 0 && (
                <span aria-hidden className="mr-4 h-px w-5 self-center bg-alabaster/25" />
              )}
              <span className="label text-alabaster/90" data-numeric>
                {f.value}
              </span>
              <span className="label text-alabaster/62">{f.label}</span>
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
