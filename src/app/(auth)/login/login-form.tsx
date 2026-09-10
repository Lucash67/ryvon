"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/runtime";
import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const destination = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login") ? nextPath : "/dashboard";

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="w-full max-w-[420px]">
          <section
            className="overflow-hidden rounded-[28px] border border-border p-6 sm:p-8"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--primary) 10%, var(--surface)) 0%, var(--surface) 42%, color-mix(in srgb, var(--accent) 4%, var(--surface)) 100%)",
              boxShadow: "var(--shadow)",
            }}
          >
            <BrandMark className="mb-8" />

            <p className="text-[11px] font-bold tracking-[0.14em] text-primary uppercase">Acesso seguro</p>
            <h1 className="mt-2 text-[29px] font-black tracking-[-0.04em] text-foreground">Entrar na RYVON</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Evolução em movimento. Acesse sua rotina, treinos e progresso com sua conta.
            </p>

            {!isSupabaseConfigured() ? (
              <p className="mt-4 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2.5 text-[12px] leading-relaxed text-warning">
                Supabase não configurado. Defina as variáveis de ambiente ou use{" "}
                <code className="text-foreground">NEXT_PUBLIC_AUTH_DISABLED=true</code> apenas em desenvolvimento local.
              </p>
            ) : null}

            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!isSupabaseConfigured()) {
                  setError("Configure o Supabase antes de entrar.");
                  return;
                }
                setPending(true);
                setError("");
                const form = new FormData(event.currentTarget);
                try {
                  const supabase = createClient();
                  const { error: authError } = await supabase.auth.signInWithPassword({
                    email: String(form.get("email")),
                    password: String(form.get("password")),
                  });
                  if (authError) {
                    setError(
                      authError.message.toLowerCase().includes("invalid")
                        ? "E-mail ou senha incorretos."
                        : authError.message,
                    );
                    setPending(false);
                    return;
                  }
                  router.push(destination);
                  router.refresh();
                } catch {
                  setError("Não foi possível conectar ao serviço de autenticação.");
                  setPending(false);
                }
              }}
            >
              <div>
                <Label>E-mail</Label>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </div>
              <FieldError message={error} />
              <Button type="submit" className="w-full" size="lg" disabled={pending || !isSupabaseConfigured()}>
                {pending ? "Entrando..." : "Entrar →"}
              </Button>
            </form>
          </section>

          <p className="mt-6 text-center text-[11px] text-muted">
            RYVON · health-tech · disciplina · dados · evolução real
          </p>
        </div>
      </div>
    </div>
  );
}
