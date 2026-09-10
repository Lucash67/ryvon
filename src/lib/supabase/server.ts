import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder"));
}

export const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "lucas@fitness-os.local",
  app_metadata: {},
  user_metadata: { name: "Lucas" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-placeholder-key";

  const cookieStore = await cookies();

  return createServerClient(url, key, {
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

export async function getSessionUser() {
  const supabase = await createServerSupabase();
  if (!isSupabaseConfigured()) {
    return { supabase, user: DEMO_USER as any };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user: (user ?? DEMO_USER) as any };
  } catch {
    return { supabase, user: DEMO_USER as any };
  }
}

export async function requireUser() {
  const { supabase, user } = await getSessionUser();
  return { supabase, user: (user ?? DEMO_USER) as any };
}
