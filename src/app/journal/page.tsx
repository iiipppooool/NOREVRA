import type { Metadata } from "next";
import Link from "next/link";
import { journalSorted } from "@/data/journal";
import { brand } from "@/data/brand";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = buildMetadata({
  title: "Journal",
  description: `Writing from the ${brand.name} workshop: materials, making, and the rooms our furniture ends up in.`,
  path: "/journal",
});

export default function JournalPage() {
  const [lead, ...rest] = journalSorted;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
        ])}
      />

      <Masthead
        eyebrow="Journal"
        title="Notes on making, and on the rooms afterwards."
        lede="We write when something has been resolved, which is four or five times a year. There is no editorial calendar."
      />

      <div className="gutter pb-[var(--spacing-section)]">
        {/* Lead piece */}
        <article className="group rule-t pt-10">
          <Link href={`/journal/${lead.slug}`} className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Media
                src={lead.images[0].src}
                alt={lead.images[0].alt}
                width={lead.images[0].width}
                height={lead.images[0].height}
                aspect="aspect-[16/10]"
                sizes="(min-width:1024px) 56vw, 100vw"
                priority
                hoverZoom
                quality={78}
              />
            </div>
            <div className="flex flex-col justify-center lg:col-span-5">
              <p className="label text-mist">
                {lead.category} · {formatDate(lead.date)} · {lead.readMinutes} min read
              </p>
              <h2 className="mt-4 font-display text-display leading-[1.02] text-ink transition-colors duration-500 group-hover:text-graphite">
                {lead.title}
              </h2>
              <p className="editorial mt-6 text-smoke">{lead.standfirst}</p>
              <p className="label mt-7 text-mist">{lead.author}</p>
              <span className="link-draw label-lg mt-7 inline-block self-start text-ink">
                Read the piece
              </span>
            </div>
          </Link>
        </article>

        {/* The rest */}
        <ul className="mt-[clamp(3rem,6vw,5rem)] grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal as="li" key={post.slug} delay={i * 80}>
              <article className="group">
                <Link href={`/journal/${post.slug}`} className="block">
                  <Media
                    src={post.images[0].src}
                    alt={post.images[0].alt}
                    width={post.images[0].width}
                    height={post.images[0].height}
                    aspect="aspect-[4/5]"
                    sizes="(min-width:768px) 31vw, 100vw"
                    hoverZoom
                    quality={72}
                  />
                  <p className="label mt-5 text-mist">
                    {post.category} · {formatDate(post.date)}
                  </p>
                  <h2 className="mt-3 font-display text-heading leading-snug text-ink transition-colors duration-500 group-hover:text-graphite">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-small text-smoke">{post.standfirst}</p>
                  <p className="label mt-5 text-mist">
                    {post.author} · {post.readMinutes} min
                  </p>
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </>
  );
}
