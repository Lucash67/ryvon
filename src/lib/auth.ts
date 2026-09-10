import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAuthDisabled } from "@/lib/runtime";
import { getSessionUser } from "@/lib/supabase/server";
import { DEMO_USER } from "@/lib/supabase/demo-user";

export async function requireSession(): Promise<{
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createServerSupabase>>;
  user: User;
}> {
  if (isAuthDisabled()) {
    const { supabase } = await getSessionUser();
    return { supabase, user: DEMO_USER };
  }

  const { supabase, user } = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
