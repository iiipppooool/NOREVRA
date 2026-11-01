import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { BagPage } from "@/components/bag/BagPage";

export const metadata: Metadata = buildMetadata({
  title: "Shopping bag",
  description: "Review your pieces, finishes and lead times before ordering.",
  path: "/bag",
  noIndex: true,
});

export default function Page() {
  return (
    <>
      <Masthead
        eyebrow="Order"
        title="Your bag."
        lede="Everything here is made to order. Finishes and a delivery window are confirmed by email before production begins."
      />
      <Suspense
        fallback={
          <div className="gutter py-20">
            <p className="label text-mist">Loading your bag…</p>
          </div>
        }
      >
        <BagPage />
      </Suspense>
    </>
  );
}
