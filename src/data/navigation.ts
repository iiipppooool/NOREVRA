export type NavItem = {
  label: string;
  href: string;
  /** Optional flyout content for the desktop header. */
  panel?: "collections" | "furniture";
};

export const primaryNav: NavItem[] = [
  { label: "Collections", href: "/collections", panel: "collections" },
  { label: "Furniture", href: "/furniture", panel: "furniture" },
  { label: "Our Story", href: "/our-story" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Catalogue",
    links: [
      { label: "All furniture", href: "/furniture" },
      { label: "Collections", href: "/collections" },
      { label: "Seating", href: "/furniture?category=seating" },
      { label: "Tables", href: "/furniture?category=tables" },
      { label: "Storage", href: "/furniture?category=storage" },
      { label: "Lighting", href: "/furniture?category=lighting" },
    ],
  },
  {
    heading: "House",
    links: [
      { label: "Our story", href: "/our-story" },
      { label: "Materials", href: "/our-story#materials" },
      { label: "Journal", href: "/journal" },
      { label: "Trade & specification", href: "/contact#trade" },
      { label: "Showroom", href: "/contact" },
    ],
  },
  {
    heading: "Service",
    links: [
      { label: "Delivery", href: "/legal/terms#delivery" },
      { label: "Care & repair", href: "/legal/terms#care" },
      { label: "Returns", href: "/legal/terms#returns" },
      { label: "Shopping bag", href: "/bag" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
];
