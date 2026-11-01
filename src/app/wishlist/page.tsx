import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Masthead } from "@/components/ui/Masthead";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata: Metadata = buildMetadata({
  title: "Saved pieces",
  description: "Pieces you have set aside, held in this browser.",
  path: "/wishlist",
  noIndex: true,
});

export default function Page() {
  return (
    <>
      <Masthead
        eyebrow="Saved"
        title="Pieces you have set aside."
        lede="Held in this browser rather than an account, so there is nothing to sign in to and nothing of yours on our servers."
      />
      <WishlistView />
    </>
  );
}
