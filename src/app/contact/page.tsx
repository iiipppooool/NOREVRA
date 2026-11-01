import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/data/brand";
import { siteAssets } from "@/data/assets";
import { buildMetadata, breadcrumbLd, JsonLd } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Speak to the ${brand.name} studio in Milan, the workshop in Meda, or our specification office in London. Appointments, samples and trade terms.`,
  path: "/contact",
  image: {
    src: siteAssets.contact.src,
    width: siteAssets.contact.width,
    height: siteAssets.contact.height,
    alt: siteAssets.contact.alt,
  },
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <Masthead
        eyebrow="Contact"
        title="Come and sit on it."
        lede="A photograph cannot tell you how low thirty-eight centimetres feels. If you are anywhere near Milan, make an appointment — we will set aside the hour."
      />

      <div className="gutter pb-[clamp(3rem,6vw,5rem)]">
        <Media
          src={siteAssets.contact.src}
          alt={siteAssets.contact.alt}
          width={siteAssets.contact.width}
          height={siteAssets.contact.height}
          aspect="aspect-[16/9]"
          sizes="100vw"
          priority
          quality={80}
        />
      </div>

      <div className="gutter pb-[var(--spacing-section)]">
        <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-16 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <Eyebrow index="01">Write to us</Eyebrow>
            <h2 className="mt-5 font-display text-title text-ink">Send an enquiry</h2>
            <Suspense fallback={<p className="label mt-9 text-mist">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>

          {/* Direct */}
          <div className="lg:col-span-4 lg:col-start-9">
            <Eyebrow index="02">Direct</Eyebrow>
            <h2 className="mt-5 font-display text-title text-ink">Or skip the form</h2>

            <dl className="mt-8 rule-t">
              {[
                { label: "Studio", value: brand.email.general },
                { label: "Trade and specification", value: brand.email.trade },
                { label: "Care and repair", value: brand.email.care },
                { label: "Press", value: brand.email.press },
              ].map((row) => (
                <div key={row.label} className="rule-b py-4">
                  <dt className="label text-mist">{row.label}</dt>
                  <dd className="mt-1.5">
                    <a href={`mailto:${row.value}`} className="link-draw label-lg text-ink">
                      {row.value}
                    </a>
                  </dd>
                </div>
              ))}
              <div className="rule-b py-4">
                <dt className="label text-mist">Telephone</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:${brand.telephone.href}`}
                    className="link-draw label-lg text-ink"
                    data-numeric
                  >
                    {brand.telephone.display}
                  </a>
                </dd>
              </div>
            </dl>

            <div id="samples" className="mt-12 bg-limestone/55 p-7">
              <h3 className="label-lg text-ink">Material samples</h3>
              <p className="mt-3 text-small text-smoke">
                We send up to eight samples anywhere in the world, free. Ask for them by name in the
                form — a finish you cannot see in your own light is a finish you have not chosen.
              </p>
            </div>

            <div id="trade" className="mt-7 bg-limestone/55 p-7">
              <h3 className="label-lg text-ink">Trade and specification</h3>
              <p className="mt-3 text-small text-smoke">
                Our Milan and London teams work directly with architects and interior designers on
                drawings, finishes, lead times and site access. Trade terms on application. CAD and
                specification sheets are available for every piece.
              </p>
              <p className="mt-4">
                <a href={`mailto:${brand.email.trade}`} className="link-draw label text-ink">
                  {brand.email.trade}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <section aria-labelledby="addresses-heading" className="mt-[clamp(4rem,8vw,7rem)] rule-t pt-12">
          <Eyebrow index="03">Where to find us</Eyebrow>
          <h2 id="addresses-heading" className="mt-5 font-display text-title text-ink">
            Three addresses.
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3">
            {brand.locations.map((loc, i) => (
              <Reveal as="li" key={loc.id} delay={i * 70} className="rule-t pt-7">
                <p className="label text-mist">{loc.label}</p>
                <h3 className="mt-2 font-display text-heading text-ink">{loc.city}</h3>
                <address className="mt-4 text-small not-italic text-smoke">
                  {loc.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <div className="mt-4 space-y-1">
                  {loc.hours.map((h) => (
                    <p key={h} className="label text-mist">
                      {h}
                    </p>
                  ))}
                </div>
                <p className="mt-4 text-small text-smoke">{loc.note}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [...loc.lines].join(", "),
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-draw label mt-5 inline-block text-ink"
                >
                  Open in maps
                </a>
              </Reveal>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
