/**
 * Smoke-test Supabase from .env.local (anon REST read on products).
 * Run: npm run verify:supabase
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy from .env.example and set Supabase keys.");
  process.exit(1);
}

/** Minimal KEY=value parser (no multiline values). */
function loadEnvFile(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = loadEnvFile(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const service = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anon) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

if (!anon.startsWith("eyJ")) {
  console.warn(
    "Warning: anon key does not look like a JWT (eyJ…). Legacy anon keys work best with @supabase/ssr.",
  );
}

const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/products?select=id&limit=1`, {
  headers: {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  },
});

const body = await res.text();
if (!res.ok) {
  console.error(`REST failed HTTP ${res.status}:`, body.slice(0, 500));
  process.exit(1);
}

console.log("Supabase anon REST: OK (products readable)");
console.log("Sample:", body.slice(0, 120));
if (service) {
  const jwt = service.startsWith("eyJ");
  const secret = service.startsWith("sb_secret_");
  console.log(
    jwt
      ? "Service role: JWT present (server routes OK)."
      : secret
        ? "Service role: sb_secret_… present (OK with current supabase-js)."
        : "Service role: use Dashboard → API → service_role JWT or secret key.",
  );
}
