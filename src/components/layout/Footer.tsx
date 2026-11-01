import Link from "next/link";
import { brand, legalPages } from "@/data/brand";
import { footerNav } from "@/data/navigation";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-alabaster">
      <div className="gutter">
        {/* Masthead */}
        <div className="grid grid-cols-1 gap-12 border-b border-alabaster/12 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="wordmark text-[1.0625rem] text-alabaster md:text-[1.25rem]">
              {brand.wordmark}
            </p>
            <p className="editorial mt-7 max-w-[26rem] text-alabaster/70">{brand.summary}</p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <p className="label mb-6 text-alabaster/45">Newsletter</p>
            <NewsletterForm tone="light" />
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <p className="label mb-6 text-alabaster/45">Enquiries</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${brand.email.general}`}
                  className="link-draw text-small text-alabaster/80"
                >
                  {brand.email.general}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email.trade}`}
                  className="link-draw text-small text-alabaster/80"
                >
                  {brand.email.trade}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.telephone.href}`}
                  className="link-draw text-small text-alabaster/80"
                  data-numeric
                >
                  {brand.telephone.display}
                </a>
              </li>
            </ul>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {brand.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-draw label text-alabaster/60"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Directory */}
        <div className="grid grid-cols-2 gap-10 border-b border-alabaster/12 py-[clamp(2.5rem,5vw,4rem)] md:grid-cols-3 lg:grid-cols-6">
          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="label mb-5 text-alabaster/45">{group.heading}</p>
              <ul className="space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-draw text-small text-alabaster/75">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {brand.locations.map((loc) => (
            <div key={loc.id}>
              <p className="label mb-5 text-alabaster/45">
                {loc.label} — {loc.city}
              </p>
              <address className="text-small not-italic text-alabaster/75">
                {loc.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="label mt-4 text-alabaster/40">{loc.hours[0]}</p>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-5 py-9 md:flex-row md:items-center md:justify-between">
          <p className="label text-alabaster/40">
            © {year} {brand.legalEntity}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {legalPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/legal/${p.slug}`} className="link-draw label text-alabaster/50">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label text-alabaster/40">
            {brand.commerce.taxLabel} included · Est. {brand.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
