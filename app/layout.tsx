import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteBackground from "@/components/SiteBackground";
import WovenBorder from "@/components/WovenBorder";
import ThemeProvider, { themeInitScript } from "@/components/ThemeProvider";
import ToastProvider from "@/components/Toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400","500","600","700"],
  style: ["normal","italic"],
});

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  weight: ["400","500","600","700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://harvestchurchethiopia.org";
const siteName = "Harvest Church of God Ethiopia";
const description =
  "A family of faith in Addis Ababa, Ethiopia — join us for worship, sermons, events, and ministries. መከር የእግዚአብሔር ቤተ-ክርስቲያን ኢትዮጲያ.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — መከር የእግዚአብሔር ቤተ-ክርስቲያን`, template: `%s — ${siteName}` },
  description,
  keywords: [
    "Harvest Church of God Ethiopia", "Addis Ababa church", "Ethiopian church",
    "Christian church Ethiopia", "church sermons", "church events Addis Ababa",
    "መከር የእግዚአብሔር ቤተ-ክርስቲያን",
  ],
  authors: [{ name: siteName }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — መከር የእግዚአብሔር ቤተ-ክርስቲያን`,
    description,
    url: siteUrl,
    locale: "en_US",
    images: [{ url: "/images/building.jpg", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/images/building.jpg"],
  },
  icons: { icon: "/images/logo.jpg", apple: "/images/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${source.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <ToastProvider>
            <SiteBackground />
            <Navbar />
            <WovenBorder tone="gold" className="opacity-80" />
            <main>{children}</main>
            <WovenBorder tone="gold" className="opacity-80" />
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
