import { Eyebrow } from "./Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Breadcrumb } from "./Breadcrumb";
import { cn } from "@/lib/utils";

/**
 * The masthead every interior page opens with: breadcrumb, section marker,
 * one display line, and at most one paragraph. No hero image — interior pages
 * earn their photography further down.
 */
export function Masthead({
  eyebrow,
  index,
  title,
  lede,
  trail,
  meta,
  className,
}: {
  eyebrow: string;
  index?: string;
  title: string;
  lede?: string;
  trail?: { name: string; path: string }[];
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "gutter pb-[clamp(2.5rem,5vw,4.5rem)] pt-[calc(5.75rem+2.75rem)] md:pt-[calc(6.75rem+3.5rem)]",
        className,
      )}
    >
      {trail && (
        <div className="pb-10">
          <Breadcrumb trail={trail} />
        </div>
      )}
      <div className="grid grid-cols-1 items-end gap-x-8 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Eyebrow index={index}>{eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-display text-ink">
            <SplitText>{title}</SplitText>
          </h1>
        </div>
        {(lede || meta) && (
          <Reveal variant="copy" delay={200} className="lg:col-span-4 lg:pb-2">
            {lede && <p className="editorial max-w-[30rem] text-smoke">{lede}</p>}
            {meta && <div className="mt-7">{meta}</div>}
          </Reveal>
        )}
      </div>
    </header>
  );
}
