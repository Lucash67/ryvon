import { getSessionUser } from "@/lib/supabase/server";

const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "lucas@fitness-os.local",
  app_metadata: {},
  user_metadata: { name: "Lucas" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export async function requireSession() {
  try {
    const { supabase, user } = await getSessionUser();
    return { supabase, user: (user ?? DEMO_USER) as any };
  } catch {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();
    return { supabase, user: DEMO_USER as any };
  }
}
