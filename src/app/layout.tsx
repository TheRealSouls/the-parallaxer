import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Newsreader, Source_Serif_4, Archivo_Narrow, Silkscreen } from "next/font/google";
import { Masthead } from "@/components/Masthead";
import { OrganisationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-archivo-narrow",
});

/**
 * A pixel face, used only for the three labels on the map. It is the one place
 * the site is deliberately not a newspaper, because the diagram is built out of
 * squares and the lettering should admit it.
 */
const silkscreen = Silkscreen({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.statement}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} RSS` }],
      "application/atom+xml": [{ url: "/atom.xml", title: `${site.name} Atom` }],
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IE",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${sourceSerif.variable} ${archivoNarrow.variable} ${silkscreen.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="label focus:bg-ink focus:text-paper sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <OrganisationJsonLd />
        <WebSiteJsonLd />
        <Masthead />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />

        {/*
          Traffic counts and real-user performance timings. Both are aggregate
          and cookieless, which is what lets the privacy policy keep saying we
          run no analytics that identify anyone individually. Neither reports
          anything outside a Vercel deployment, so local runs stay silent.
        */}
        <Analytics />
        <SpeedInsights />

        {/*
          Font Awesome kit, for icons used in page copy. The three lens glyphs on
          the map do not come from here: they are inlined into the server-rendered
          SVG so the front page never flashes without them. Loaded after
          hydration so it cannot block first paint.
        */}
        <Script
          src="https://kit.fontawesome.com/d24d18c78a.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
