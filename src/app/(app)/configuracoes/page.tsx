import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/app/(app)/configuracoes/settings-form";
import { requireSession } from "@/lib/auth";
import { loadTrainingModule } from "@/services/loaders";

export default async function ConfiguracoesPage() {
  const { supabase, user } = await requireSession();
  const data = await loadTrainingModule(supabase, user.id);
  return (
    <div>
      <PageHeader title="Configurações" subtitle="Metas, macros e estrutura dos treinos." />
      <SettingsForm profile={data.profile} settings={data.settings} catalog={data.catalog} />
    </div>
  );
}
