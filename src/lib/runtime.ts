/**
 * Runtime mode: DEMO/DEVELOPMENT vs REAL AUTH/PRODUCTION.
 *
 * - Production never allows demo/mock fallback.
 * - Local demo requires NEXT_PUBLIC_AUTH_DISABLED=true (or NEXT_PUBLIC_DEMO_MODE=true).
 */

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export function isAuthDisabled() {
  return process.env.NEXT_PUBLIC_AUTH_DISABLED === "true";
}

/** Explicit local demo — never active in production. */
export function isDemoMode() {
  if (isProductionRuntime()) return false;
  return isAuthDisabled() || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function isAuthEnabled() {
  return !isAuthDisabled();
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder"));
}

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder")) {
    return null;
  }
  return { url, key };
}

export type ConfigIssue = "missing_supabase" | "demo_blocked_in_production";

export function getConfigurationIssue(): ConfigIssue | null {
  if (isProductionRuntime() && isAuthDisabled()) {
    return "demo_blocked_in_production";
  }
  if (isAuthEnabled() && !isSupabaseConfigured()) {
    return "missing_supabase";
  }
  return null;
}

export function assertAuthConfiguration() {
  const issue = getConfigurationIssue();
  if (issue) {
    throw new Error(`RYVON configuration error: ${issue}`);
  }
}
