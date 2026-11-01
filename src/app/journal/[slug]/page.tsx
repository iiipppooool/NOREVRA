import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { journal, postBySlug, journalSorted } from "@/data/journal";
import { buildMetadata, breadcrumbLd, articleLd, JsonLd } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SplitText } from "@/components/motion/SplitText";
import { formatDate } from "@/lib/format";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journal.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return { title: "Not found" };
  const img = post.images[0];
  return buildMetadata({
    title: post.title,
    description: post.standfirst,
    path: `/journal/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    image: { src: img.src, width: img.width, height: img.height, alt: img.alt },
  });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  const related = post.related
    .map((s) => postBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const more = related.length ? related : journalSorted.filter((p) => p.slug !== post.slug).slice(0, 2);

  const trail = [
    { name: "Journal", path: "/journal" },
    { name: post.title, path: `/journal/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={[articleLd(post), breadcrumbLd([{ name: "Home", path: "/" }, ...trail])]} />

      <article>
        <header className="gutter pb-[clamp(2.5rem,5vw,4rem)] pt-[calc(5.75rem+2.75rem)] md:pt-[calc(6.75rem+3.5rem)]">
          <div className="pb-10">
            <Breadcrumb trail={trail} />
          </div>
          <div className="max-w-[52rem]">
            <p className="label text-mist">
              {post.category} · {formatDate(post.date)} · {post.readMinutes} min read
            </p>
            <h1 className="mt-6 font-display text-display leading-[1.02] text-ink">
              <SplitText>{post.title}</SplitText>
            </h1>
            <p className="editorial mt-8 max-w-[38rem] text-smoke">{post.standfirst}</p>
            <p className="label mt-8 text-mist">Words by {post.author}</p>
          </div>
        </header>

        {/* Opening plate */}
        <div className="gutter">
          <Media
            src={post.images[0].src}
            alt={post.images[0].alt}
            width={post.images[0].width}
            height={post.images[0].height}
            aspect="aspect-[16/10]"
            sizes="100vw"
            priority
            quality={80}
          />
        </div>

        {/* Body. A single measured column, with plates breaking out of it. */}
        <div className="gutter py-[clamp(3.5rem,7vw,6rem)]">
          <div className="mx-auto max-w-[44rem]">
            {post.body.map((block, i) => {
              switch (block.type) {
                case "h":
                  return (
                    <Reveal key={i}>
                      <h2 className="mt-14 font-display text-title text-ink first:mt-0">
                        {block.text}
                      </h2>
                    </Reveal>
                  );
                case "p":
                  return (
                    <Reveal key={i}>
                      <p className="mt-6 text-lead leading-relaxed text-graphite first:mt-0">
                        {block.text}
                      </p>
                    </Reveal>
                  );
                case "quote":
                  return (
                    <Reveal key={i}>
                      <blockquote className="my-14 border-l border-ink pl-7">
                        <p className="font-display text-heading italic leading-snug text-ink">
                          “{block.text}”
                        </p>
                        {block.attribution && (
                          <footer className="label mt-5 text-mist">{block.attribution}</footer>
                        )}
                      </blockquote>
                    </Reveal>
                  );
                case "plate": {
                  const img = post.images[block.image];
                  if (!img) return null;
                  return (
                    <figure
                      key={i}
                      className="my-14 lg:-mx-[clamp(0rem,8vw,9rem)]"
                    >
                      <Media
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        aspect={img.width > img.height ? "aspect-[16/10]" : "aspect-[4/5]"}
                        sizes="(min-width:1024px) 62vw, 100vw"
                        quality={78}
                      />
                      <figcaption className="label mt-4 text-mist">{block.caption}</figcaption>
                    </figure>
                  );
                }
              }
            })}
          </div>
        </div>
      </article>

      {/* More */}
      <section aria-labelledby="more-heading" className="gutter rule-t py-[clamp(3.5rem,7vw,6rem)]">
        <Eyebrow>Journal</Eyebrow>
        <h2 id="more-heading" className="mt-5 font-display text-title text-ink">
          Also worth reading
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {more.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 80}>
              <Link href={`/journal/${p.slug}`} className="group flex gap-6">
                <Media
                  src={p.images[0].src}
                  alt=""
                  width={p.images[0].width}
                  height={p.images[0].height}
                  aspect="aspect-[4/5]"
                  className="w-32 shrink-0 sm:w-40"
                  sizes="160px"
                  hoverZoom
                  quality={62}
                />
                <div>
                  <p className="label text-mist">
                    {p.category} · {formatDate(p.date)}
                  </p>
                  <h3 className="mt-2 font-display text-heading leading-snug text-ink transition-colors duration-500 group-hover:text-graphite">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-small text-smoke">{p.standfirst}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
