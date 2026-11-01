import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { legalDocuments, legalBySlug } from "@/data/legal";
import { brand } from "@/data/brand";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { formatDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return legalDocuments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  if (!doc) return { title: "Not found" };
  return buildMetadata({
    title: doc.title,
    description: doc.standfirst,
    path: `/legal/${doc.slug}`,
  });
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  if (!doc) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: doc.title, path: `/legal/${doc.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />

      <Masthead
        eyebrow="Legal"
        title={doc.title}
        lede={doc.standfirst}
        meta={
          <p className="label text-mist">
            Last updated {formatDate(doc.updated)} · {brand.legalEntity}
          </p>
        }
      />

      <div className="gutter pb-[var(--spacing-section)]">
        <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-12 lg:grid-cols-12">
          {/* Contents */}
          <nav aria-label="On this page" className="lg:col-span-3">
            <div className="lg:sticky lg:top-[8rem]">
              <p className="label text-mist">On this page</p>
              <ol className="mt-5 space-y-2.5">
                {doc.sections.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="label shrink-0 text-mist" data-numeric>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a href={`#${s.id}`} className="link-draw label text-smoke">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>

              <p className="label mt-10 text-mist">Other documents</p>
              <ul className="mt-4 space-y-2.5">
                {legalDocuments
                  .filter((d) => d.slug !== doc.slug)
                  .map((d) => (
                    <li key={d.slug}>
                      <Link href={`/legal/${d.slug}`} className="link-draw label text-smoke">
                        {d.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </nav>

          {/* Body */}
          <div className="lg:col-span-8 lg:col-start-5">
            <div className="max-w-[44rem] rule-t">
              {doc.sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-32 rule-b py-10">
                  <div className="flex gap-5">
                    <span className="label shrink-0 pt-2 text-mist" data-numeric>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-display text-heading text-ink">{s.heading}</h2>
                      <div className="mt-4 space-y-4">
                        {s.body.map((p, j) => (
                          <p key={j} className="text-body text-smoke">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
