"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted">RYVON</p>
          <h1 className="mt-2 text-2xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-muted">Painel operacional de evolução física.</p>
          {!isSupabaseConfigured() ? (
            <p className="mt-4 rounded-xl bg-[#fff6e5] px-3 py-2 text-sm text-warning">
              Configure `.env.local` com as chaves do Supabase antes de entrar. Veja o README.
            </p>
          ) : null}
          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError("");
              const form = new FormData(event.currentTarget);
              const supabase = createClient();
              const { error: authError } = await supabase.auth.signInWithPassword({
                email: String(form.get("email")),
                password: String(form.get("password")),
              });
              setPending(false);
              if (authError) {
                setError(authError.message);
                return;
              }
              router.push("/dashboard");
              router.refresh();
            }}
          >
            <div>
              <Label>E-mail</Label>
              <Input name="email" type="email" autoComplete="email" required defaultValue="lucas@fitness-os.local" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input name="password" type="password" autoComplete="current-password" required />
            </div>
            <FieldError message={error} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
