import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(projectRoot);

// If a parent directory has another `package-lock.json`, Next may mis-detect the monorepo root.
// `outputFileTracingRoot` keeps tracing (and dev manifests) aligned with this app folder.

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  // Webpack dev + iCloud/synced folders often corrupt `.next/dev` (ENOENT on routes-manifest).
  // Prefer `npm run dev:karlmaxx` (Turbopack). This only affects `--webpack` dev if you use it.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Dev uses Turbopack by default in Next 16; empty config acknowledges coexistence with `webpack` (used for `next build --webpack`).
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
