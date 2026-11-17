import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabeer-dev.github.io/my-web";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sabeer Market — Food prices you can plan around",
    template: "%s — Sabeer Market"
  },
  description:
    "Track rice, beans, tomatoes, onions, proteins and cooking essentials across 24 Nigerian markets. Sabeer Market checks food prices every morning so you can plan your week and spot a fair price.",
  openGraph: {
    type: "website",
    siteName: "Sabeer Market",
    title: "Sabeer Market — Food prices you can plan around",
    description:
      "Live food market prices for rice, beans, tomatoes, onions, proteins and cooking essentials. Checked every morning across 24 Nigerian markets.",
    images: [{ url: "/assets/og-cover.jpg", width: 1200, height: 630, alt: "Sabeer Market — know the price before you leave home." }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabeer Market — Food prices you can plan around",
    description:
      "Live food market prices for rice, beans, tomatoes, onions, proteins and cooking essentials. Checked every morning across 24 Nigerian markets.",
    images: ["/assets/og-cover.jpg"]
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%2307251b'/%3E%3Cpath d='M48 15C30 15 18 25 18 41c0 4 1 7 1 7s6-15 29-27Z' fill='%23b9f36a'/%3E%3Cpath d='M19 48c5-11 15-19 28-24' stroke='%2307251b' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#04160f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/assets/hero-market.webp" type="image/webp" />
      </head>
      <body>
        <div className="announcement">
          <span className="announcement-dot" aria-hidden="true" />
          <span>Food prices checked every morning</span>
          <span className="announcement-sep" aria-hidden="true">·</span>
          <span>24 markets. 180+ everyday items.</span>
          <a href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">Get a free alert ↗</a>
        </div>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
