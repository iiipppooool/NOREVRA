import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { products, productBySlug, priceRange } from "@/data/products";
import { collectionById } from "@/data/collections";
import { designerById } from "@/data/brand";
import { buildMetadata, productLd, breadcrumbLd, JsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/format";
import { ProductView } from "@/components/product/ProductView";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Media } from "@/components/ui/Media";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Not found" };
  const { min } = priceRange(product);
  const hero = product.images[0];
  return buildMetadata({
    title: `${product.name} — ${product.typology}`,
    description: `${product.summary} ${product.typology} by ${designerById(product.designer)?.name}, from ${formatPrice(min)}.`,
    path: `/furniture/${product.slug}`,
    image: { src: hero.src, width: hero.width, height: hero.height, alt: hero.alt },
  });
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const collection = collectionById(product.collection);
  const designer = designerById(product.designer);
  const context = product.images.find((i) => i.kind === "context");

  const trail = [
    { name: "Furniture", path: "/furniture" },
    ...(collection ? [{ name: collection.name, path: `/collections/${collection.id}` }] : []),
    { name: product.name, path: `/furniture/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={[productLd(product), breadcrumbLd([{ name: "Home", path: "/" }, ...trail])]} />

      <div className="gutter pb-10 pt-[calc(5.75rem+2.5rem)] md:pt-[calc(6.75rem+3rem)]">
        <Breadcrumb trail={trail} />
      </div>

      {/* The gallery escapes the gutter on small screens so frames are
          full-bleed, which is how photography should be read on a phone. */}
      <div className="gutter">
        <ProductView product={product} />
      </div>

      {/* The piece in a room, full bleed. */}
      {context && (
        <section aria-label={`${product.name} in an interior`} className="mt-[clamp(4rem,8vw,7rem)]">
          <Parallax amount={0.08} className="h-[62svh] min-h-[22rem] bg-ink">
            <Media
              src={context.src}
              alt={context.alt}
              width={context.width}
              height={context.height}
              className="h-full"
              imgClassName="h-full"
              sizes="100vw"
              curtain={false}
              quality={80}
            />
          </Parallax>
          <div className="gutter pt-4">
            <p className="label max-w-[36rem] text-mist">{context.alt}</p>
          </div>
        </section>
      )}

      {/* Designer note and the collection it belongs to. */}
      <section className="gutter py-[clamp(3.5rem,7vw,6rem)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          {designer && (
            <Reveal className="lg:col-span-5">
              <Eyebrow>Designer</Eyebrow>
              <h2 className="mt-5 font-display text-title text-ink">{designer.name}</h2>
              <p className="label mt-2 text-mist">{designer.role}</p>
              <p className="editorial mt-6 max-w-[28rem] text-smoke">{designer.bio}</p>
            </Reveal>
          )}

          {collection && (
            <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
              <Eyebrow index={collection.index}>Collection</Eyebrow>
              <h2 className="mt-5 font-display text-title text-ink">
                {collection.name}
                <span className="text-mist"> — {collection.strapline}</span>
              </h2>
              <p className="editorial mt-6 max-w-[34rem] text-smoke">{collection.description[0]}</p>
              <Link
                href={`/collections/${collection.id}`}
                data-touch-target
                className="link-draw label-lg mt-7 inline-block text-ink"
              >
                The whole collection
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <RelatedProducts slug={product.slug} />
    </>
  );
}
