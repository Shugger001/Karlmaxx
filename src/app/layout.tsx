import { AppChrome } from "@/components/AppChrome";
import { Providers } from "@/components/Providers";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const retail = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-retail",
});

export const metadata: Metadata = {
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
    <html lang="en" className={retail.variable} suppressHydrationWarning>
      <body className={retail.className} suppressHydrationWarning>
        <SupabaseConfigBanner />
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
