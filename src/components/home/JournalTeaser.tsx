import Link from "next/link";
import { journalSorted } from "@/data/journal";
import { Media } from "@/components/ui/Media";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function JournalTeaser() {
  const [lead, ...rest] = journalSorted.slice(0, 3);

  return (
    <section
      aria-labelledby="journal-heading"
      className="gutter bg-ivory pb-[var(--spacing-section)] pt-[var(--spacing-section)]"
    >
      <div className="flex flex-col gap-7 pb-12 md:flex-row md:items-end md:justify-between md:gap-16">
        <div>
          <Eyebrow index="05">Journal</Eyebrow>
          <h2 id="journal-heading" className="mt-6 font-display text-display text-ink">
            Notes from the workshop.
          </h2>
        </div>
        <Reveal delay={160} className="shrink-0 md:pb-3">
          <Link href="/journal" className="link-draw label-lg text-ink">
            All writing
          </Link>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
        {/* The lead piece gets a wide frame and the standfirst. */}
        <article className="group lg:col-span-7">
          <Link href={`/journal/${lead.slug}`} className="block">
            <Media
              src={lead.images[0].src}
              alt={lead.images[0].alt}
              width={lead.images[0].width}
              height={lead.images[0].height}
              aspect="aspect-[16/10]"
              sizes="(min-width:1024px) 56vw, 100vw"
              hoverZoom
              quality={76}
            />
            <div className="mt-6">
              <p className="label text-mist">
                {lead.category} · {formatDate(lead.date)} · {lead.readMinutes} min
              </p>
              <h3 className="mt-3 font-display text-title text-ink transition-colors duration-500 group-hover:text-graphite">
                {lead.title}
              </h3>
              <p className="editorial mt-4 max-w-[34rem] text-smoke">{lead.standfirst}</p>
            </div>
          </Link>
        </article>

        <div className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9 lg:pt-4">
          {rest.map((post, i) => (
            <article key={post.slug} className={cn("group", i > 0 && "rule-t pt-10")}>
              <Link href={`/journal/${post.slug}`} className="flex gap-6">
                <Media
                  src={post.images[0].src}
                  alt=""
                  width={post.images[0].width}
                  height={post.images[0].height}
                  aspect="aspect-[4/5]"
                  className="w-28 shrink-0 sm:w-32"
                  sizes="128px"
                  hoverZoom
                  quality={60}
                />
                <div>
                  <p className="label text-mist">{post.category}</p>
                  <h3 className="mt-2 font-display text-heading leading-snug text-ink transition-colors duration-500 group-hover:text-graphite">
                    {post.title}
                  </h3>
                  <p className="label mt-3 text-mist">
                    {formatDate(post.date)} · {post.readMinutes} min
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
