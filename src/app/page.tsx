import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  redirect("/dashboard");
}
