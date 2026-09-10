import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MESSAGES: Record<string, { title: string; body: string }> = {
  missing_supabase: {
    title: "Supabase não configurado",
    body: "Auth está ativo, mas NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não foram definidos. Configure as variáveis na Vercel ou use NEXT_PUBLIC_AUTH_DISABLED=true apenas em desenvolvimento local.",
  },
  demo_blocked_in_production: {
    title: "Modo demo bloqueado em produção",
    body: "NEXT_PUBLIC_AUTH_DISABLED=true não pode ser usado em produção. Remova essa variável e configure Supabase Auth antes do go-live.",
  },
};

export default async function ConfigurationErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "missing_supabase";
  const copy = MESSAGES[reason] ?? MESSAGES.missing_supabase;

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="py-8">
          <BrandMark className="mb-6" />
          <p className="text-[11px] font-bold tracking-[0.14em] text-danger uppercase">Configuration error</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{copy.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/login">
              <Button variant="secondary">Ir para login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
