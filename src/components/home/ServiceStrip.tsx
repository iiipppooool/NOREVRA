import { brand } from "@/data/brand";
import { Reveal } from "@/components/motion/Reveal";
import { TextLink } from "@/components/ui/Button";

/**
 * A note from the house, not a row of trust badges.
 *
 * This was three columns of heading-plus-body with an icon's worth of
 * whitespace where an icon would go — the single most template-like thing on
 * the page. The same information reads better as one sentence and a line of
 * terms, which is how a catalogue states it. The detail lives on every
 * product page, where someone deciding actually needs it.
 */
export function ServiceStrip() {
  const terms = [
    ["Delivery", "Two-person, unpacked, packaging removed"],
    ["Guarantee", "Ten years on frames, five on upholstery"],
    ["Trade", "Drawings and terms on application"],
  ] as const;

  return (
    <section aria-label="Service" className="gutter py-[clamp(2.5rem,5vw,4rem)]">
      <div className="grid grid-cols-1 items-baseline gap-x-10 gap-y-8 rule-t pt-9 lg:grid-cols-12">
        <Reveal variant="copy" className="lg:col-span-5">
          <p className="editorial max-w-[26rem] text-smoke">
            Everything is made after it is ordered, and delivered by people who know how it goes
            together.
          </p>
        </Reveal>

        <Reveal variant="copy" delay={90} className="lg:col-span-5 lg:col-start-7">
          <dl className="space-y-2.5">
            {terms.map(([k, v]) => (
              <div key={k} className="flex flex-wrap items-baseline gap-x-5">
                <dt className="label w-20 shrink-0 text-mist">{k}</dt>
                <dd className="text-small text-smoke">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal variant="copy" delay={160} className="lg:col-span-2 lg:text-right">
          <TextLink href="/contact#trade">Trade enquiries</TextLink>
        </Reveal>
      </div>
      <p className="sr-only">{brand.commerce.deliverySummary}</p>
    </section>
  );
}
