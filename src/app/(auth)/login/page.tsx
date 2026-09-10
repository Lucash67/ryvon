import { redirect } from "next/navigation";
import { isAuthDisabled } from "@/lib/flags";
import { getSessionUser } from "@/lib/supabase/server";
import { LoginForm } from "@/app/(auth)/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (isAuthDisabled()) {
    redirect("/dashboard");
  }

  const { user } = await getSessionUser();
  if (user) {
    const params = await searchParams;
    const next = params.next;
    redirect(next && next.startsWith("/") && !next.startsWith("/login") ? next : "/dashboard");
  }

  const params = await searchParams;
  return <LoginForm nextPath={params.next} />;
}
