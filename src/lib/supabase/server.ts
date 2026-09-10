import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAuthDisabled, isDemoMode, getSupabasePublicConfig } from "@/lib/runtime";
import { DEMO_USER } from "@/lib/supabase/demo-user";

export { isSupabaseConfigured } from "@/lib/runtime";

export async function createServerSupabase() {
  const config = getSupabasePublicConfig();

  const cookieStore = await cookies();

  if (!config) {
    if (isDemoMode() || isAuthDisabled()) {
      return createServerClient("https://placeholder.supabase.co", "public-anon-placeholder-key", {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      });
    }
    redirect("/auth/configuration-error?reason=missing_supabase");
  }


  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies.
        }
      },
    },
  });
}

export async function getSessionUser(): Promise<{ supabase: Awaited<ReturnType<typeof createServerSupabase>>; user: User | null }> {
  if (isAuthDisabled()) {
    const supabase = await createServerSupabase();
    return { supabase, user: DEMO_USER };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function requireUser(): Promise<{ supabase: Awaited<ReturnType<typeof createServerSupabase>>; user: User }> {
  if (isAuthDisabled()) {
    const supabase = await createServerSupabase();
    return { supabase, user: DEMO_USER };
  }

  const { supabase, user } = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
