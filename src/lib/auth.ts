import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";

export async function requireSession() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
