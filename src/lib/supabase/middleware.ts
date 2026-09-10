import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/runtime";

export async function createMiddlewareSupabase(request: NextRequest, response: NextResponse) {
  const config = getSupabasePublicConfig();
  if (!config) {
    return { supabase: null, response };
  }

  let nextResponse = response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        nextResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          nextResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response: nextResponse };
}
