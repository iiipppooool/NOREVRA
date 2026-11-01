import { siteAssets } from "@/data/assets";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TextLink } from "@/components/ui/Button";

/**
 * An asymmetric plate pairing, with a single quotation set between them. The
 * tall frame breaks the grid deliberately: it starts above the section's own
 * top edge and runs past the copy column.
 */
export function Editorial() {
  return (
    <section
      aria-labelledby="editorial-heading"
      className="gutter overflow-hidden bg-ivory pt-[var(--spacing-section)]"
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Media
            src={siteAssets.editorialTall.src}
            alt={siteAssets.editorialTall.alt}
            width={siteAssets.editorialTall.width}
            height={siteAssets.editorialTall.height}
            aspect="aspect-[14/19]"
            sizes="(min-width:1024px) 40vw, 100vw"
            quality={78}
          />
          <p className="label mt-4 max-w-[22rem] text-mist">
            Sestri Lounge, chalk bouclé on a smoked oak plinth. Via Cesare Correnti, Milan.
          </p>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7 lg:pl-8">
          <Reveal>
            <Eyebrow>Materiality</Eyebrow>
            <h2 id="editorial-heading" className="mt-6 font-display text-display text-ink">
              Stone is not a finish
            </h2>
            <blockquote className="mt-9 max-w-[32rem]">
              <p className="editorial text-smoke">
                Travertine is laid down in beds. Cut with the bed and you get the cloudy face most
                people picture; cut against it and the pores line up into a horizontal grain that
                reads almost like timber. We cut against — which exposes the voids, and we do not
                fill them.
              </p>
              <footer className="label mt-7 text-mist">
                Johanna Reiss — <cite className="not-italic">A week at Rapolano</cite>
              </footer>
            </blockquote>
            <div className="mt-9">
              <TextLink href="/journal/a-week-at-rapolano">Read the piece</TextLink>
            </div>
          </Reveal>

          <Reveal delay={160} className="mt-14">
            <Media
              src={siteAssets.editorialWide.src}
              alt={siteAssets.editorialWide.alt}
              width={siteAssets.editorialWide.width}
              height={siteAssets.editorialWide.height}
              aspect="aspect-[16/10]"
              sizes="(min-width:1024px) 48vw, 100vw"
              quality={76}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
