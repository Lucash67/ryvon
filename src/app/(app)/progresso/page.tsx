import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard, WeightChart } from "@/components/charts/simple-charts";
import { DomainEmptyState, MetricCard, MetricList, MetricRow, SectionHeader } from "@/components/v8";
import { requireSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/runtime";
import { latestWeight, listHealthNotes, listWeightLogs } from "@/services/entries.service";
import { demoLoadDashboard, demoLoadNotesAndPhotos } from "@/services/demo-state";
import { formatNumber } from "@/utils/dates";
import { HEALTH_NOTE_LABELS } from "@/domain/constants";

export default async function ProgressoPage() {
  const { supabase, user } = await requireSession();
  const [weights, latest, notes] = isDemoMode()
    ? await Promise.all([
        listWeightLogs(supabase, user.id, { limit: 90 }),
        latestWeight(supabase, user.id),
        listHealthNotes(supabase, user.id),
      ])
    : [
        demoLoadDashboard().weights,
        demoLoadDashboard().latestWeight,
        demoLoadNotesAndPhotos().notes,
      ];
  const first = weights.at(-1);
  const delta = latest && first ? latest.weight - first.weight : null;

  return (
    <div>
      <PageHeader title="Progresso" subtitle="Peso, tendência e ocorrências. Sem diagnóstico médico." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Peso atual" value={latest ? `${formatNumber(latest.weight, 1)} kg` : "—"} />
        <MetricCard label="Peso inicial" value={first ? `${formatNumber(first.weight, 1)} kg` : "—"} />
        <MetricCard
          label="Mudança total"
          value={delta == null ? "—" : `${delta > 0 ? "+" : ""}${formatNumber(delta, 1)} kg`}
        />
      </div>

      <SectionHeader title="Evolução do peso" />
      {weights.length ? (
        <ChartCard title="Histórico">
          <WeightChart
            data={[...weights].reverse().map((item) => ({
              label: item.date.slice(5),
              peso: item.weight,
            }))}
          />
        </ChartCard>
      ) : (
        <DomainEmptyState domain="Progresso" title="Você ainda não registrou seu peso." description="Use Hoje ou Progresso para registrar pesagens." />
      )}

      <SectionHeader title="Resumo corporal" />
      <Card className="hover:translate-y-0">
        <CardContent className="py-5">
          <MetricList>
            <MetricRow label="Inicial" value={first ? `${formatNumber(first.weight, 1)} kg` : "—"} />
            <MetricRow label="Atual" value={latest ? `${formatNumber(latest.weight, 1)} kg` : "—"} />
            <MetricRow label="Mudança" value={delta == null ? "—" : `${delta > 0 ? "+" : ""}${formatNumber(delta, 1)} kg`} />
          </MetricList>
        </CardContent>
      </Card>

      <SectionHeader title="Ocorrências" />
      <Card className="hover:translate-y-0">
        <CardContent className="space-y-2 py-5">
          {notes.length === 0 ? (
            <p className="text-[11px] text-muted">Nenhuma ocorrência registrada.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] text-muted">
                  {note.date} · {HEALTH_NOTE_LABELS[note.type]} · {note.status}
                </p>
                <p className="mt-1 text-sm text-foreground">{note.note}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
