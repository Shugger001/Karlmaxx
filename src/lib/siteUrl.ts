/**
 * Canonical origin for sitemaps, robots.txt, and Open Graph `metadataBase`.
 *
 * You do **not** need a custom domain for the app to run.
 *
 * - **Local:** falls back to `http://localhost:3030` (fine for development).
 * - **Vercel:** uses `VERCEL_URL` automatically (`https://….vercel.app`) until you add a domain.
 * - **Custom domain later:** set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` so sitemap/SEO
 *   use the URL you want Google and social previews to prefer.
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3030";
}
