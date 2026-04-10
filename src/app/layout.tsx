import { AppChrome } from "@/components/AppChrome";
import { Providers } from "@/components/Providers";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const retail = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  variable: "--font-retail",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  title: {
    default: "Karlmaxx | Menswear & accessories",
    template: "%s | Karlmaxx",
  },
  description:
    "Shop curated menswear, accessories, and more — fast checkout, secure payment.",
  openGraph: {
    title: "Karlmaxx | Menswear & accessories",
    description:
      "Shop curated menswear, bags, fragrance, watches & tech. Secure Paystack checkout.",
    type: "website",
    locale: "en_GH",
    siteName: "Karlmaxx Investment Limited",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karlmaxx | Menswear & accessories",
    description:
      "Curated menswear and accessories with secure checkout.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={retail.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={retail.className}>
        <SupabaseConfigBanner />
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
