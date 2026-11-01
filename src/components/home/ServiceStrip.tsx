import { brand } from "@/data/brand";
import { Reveal } from "@/components/motion/Reveal";

const items = [
  {
    title: "Delivered and installed",
    body: brand.commerce.deliverySummary,
  },
  {
    title: "Ten-year structure",
    body: brand.commerce.warranty,
  },
  {
    title: "Specification support",
    body: "Our Milan and London teams work directly with architects and interior designers on drawings, finishes and lead times. Trade terms on application.",
  },
];

/**
 * Service facts, stated plainly and once. Not badges, not icons — three
 * sentences in a hairline row, which is how a catalogue would put it.
 */
export function ServiceStrip() {
  return (
    <section aria-label="Service" className="gutter bg-limestone/55 py-[clamp(3rem,6vw,5rem)]">
      <dl className="grid grid-cols-1 gap-x-10 gap-y-9 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 90} className="rule-t pt-7">
            <dt className="label-lg text-ink">{item.title}</dt>
            <dd className="mt-3.5 max-w-[26rem] text-small text-smoke">{item.body}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
