import { redirect } from "next/navigation";
import { isAuthDisabled } from "@/lib/flags";
import { LoginForm } from "@/app/(auth)/login/login-form";

export default function LoginPage() {
  if (isAuthDisabled()) {
    redirect("/dashboard");
  }
  return <LoginForm />;
}
