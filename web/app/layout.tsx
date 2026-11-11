import type { Metadata } from "next";
import "./globals.css";
import "./store.css";
import { CartDialog } from "@/components/CartDialog";
import { CartProvider } from "@/components/CartProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabeer-solar.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sabeer Solar & Electronic Store — Power you can count on",
    template: "%s — Sabeer Solar & Electronic Store"
  },
  description:
    "Solar panels, hybrid inverters, deep-cycle batteries and everyday electronics from Sabeer Solar & Electronic Store. Reliable power for home and business.",
  openGraph: {
    type: "website",
    siteName: "Sabeer Solar & Electronic Store",
    title: "Sabeer Solar & Electronic Store — Power you can count on",
    description:
      "Solar panels, inverters, batteries and everyday electronics, chosen for performance and priced for real life.",
    images: [{ url: "/assets/og-cover.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabeer Solar & Electronic Store — Power you can count on",
    description:
      "Solar panels, inverters, batteries and everyday electronics, chosen for performance and priced for real life.",
    images: ["/assets/og-cover.png"]
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23284f40'/%3E%3Ctext x='32' y='45' font-family='Georgia,serif' font-size='38' fill='%23d7e8a2' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f7f5ef" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <div className="announcement">Sabeer Solar &amp; Electronic Store — free delivery on orders over $500</div>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDialog />
        </CartProvider>
      </body>
    </html>
  );
}
