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
            <div className="mt-9 max-w-[32rem] space-y-5">
              <p className="editorial text-smoke">
                Travertine is laid down in beds. Cut with the bed and you get the cloudy face most
                people picture; cut against it and the pores line up into a horizontal grain that
                reads almost like timber.
              </p>
              <p className="text-body text-smoke">
                We cut against. It is the harder choice, because it exposes the voids a bed cut
                hides, and filling them is standard practice in the trade. We have decided not to
                fill them. Every slab is therefore slightly different, which is why the drawing
                shows the piece and the stone is quoted against the block.
              </p>
            </div>
            <div className="mt-9">
              <TextLink href="/journal">Notes on making</TextLink>
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
