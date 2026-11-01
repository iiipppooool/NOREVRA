import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Jost } from "next/font/google";
import "./globals.css";

import { brand } from "@/data/brand";
import { siteAssets } from "@/data/assets";
import { siteUrl, absolute, organisationLd, websiteLd, JsonLd } from "@/lib/seo";
import { ChromeProvider } from "@/components/layout/Chrome";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BagDrawer } from "@/components/bag/BagDrawer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageFade } from "@/components/motion/PageFade";
import { RouteCurtain } from "@/components/motion/RouteCurtain";
import { Cursor } from "@/components/motion/Cursor";

/* The editorial serif: high contrast, one weight, display only. */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

/* The working sans: geometric, architectural, used at wide tracking. */
const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.descriptor}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.summary,
  applicationName: brand.name,
  authors: [{ name: brand.legalEntity, url: siteUrl }],
  creator: brand.legalEntity,
  publisher: brand.legalEntity,
  keywords: [
    "luxury furniture",
    "Italian furniture",
    "contemporary furniture",
    "modular sofa",
    "travertine table",
    "solid oak cabinet",
    "Brianza",
    brand.name,
  ],
  category: "Furniture",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_GB",
    url: siteUrl,
    title: `${brand.name} — ${brand.descriptor}`,
    description: brand.summary,
    images: [
      {
        url: absolute(siteAssets.ogDefault.src),
        width: siteAssets.ogDefault.width,
        height: siteAssets.ogDefault.height,
        alt: brand.name,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  formatDetection: { telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#191816" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <JsonLd data={[organisationLd(), websiteLd()]} />
        <ChromeProvider>
          <SmoothScroll />
          <Header />
          <main id="main" tabIndex={-1}>
            <PageFade>{children}</PageFade>
          </main>
          <RouteCurtain />
          <Footer />
          <BagDrawer />
          <Cursor />
        </ChromeProvider>
      </body>
    </html>
  );
}
