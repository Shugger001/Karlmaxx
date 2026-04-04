import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { NextResponse } from "next/server";

/**
 * GET /api/health/supabase — confirms the Node process sees public Supabase env.
 * Does not expose keys; use when the storefront says Supabase is disconnected.
 */
export async function GET() {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        hint: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local in project root, then restart dev).",
      },
      { status: 503 },
    );
  }

  let restOk = false;
  let restStatus = 0;
  try {
    const res = await fetch(`${env.url.replace(/\/$/, "")}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${env.anonKey}`,
      },
      cache: "no-store",
    });
    restStatus = res.status;
    restOk = res.ok;
  } catch {
    restOk = false;
  }

  return NextResponse.json({
    ok: restOk,
    configured: true,
    projectHost: new URL(env.url).host,
    restStatus,
    hint: restOk
      ? "Server can reach Supabase REST with your anon key."
      : "Env is set but REST check failed (network, paused project, or bad key). Open Dashboard → API and verify URL + anon JWT.",
  });
}
