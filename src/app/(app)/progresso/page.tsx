import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, WeightChart } from "@/components/charts/simple-charts";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { latestWeight, listHealthNotes, listWeightLogs } from "@/services/entries.service";
import { getProfileAndSettings } from "@/services/settings.service";
import { demoLoadDashboard, demoLoadNotesAndPhotos } from "@/services/demo-state";
import { formatNumber } from "@/utils/dates";
import { HEALTH_NOTE_LABELS } from "@/domain/constants";

export default async function ProgressoPage() {
  const { supabase, user } = await requireSession();
  const [{ settings }, weights, latest, notes] = isSupabaseConfigured()
    ? await Promise.all([
        getProfileAndSettings(supabase, user.id),
        listWeightLogs(supabase, user.id, { limit: 90 }),
        latestWeight(supabase, user.id),
        listHealthNotes(supabase, user.id),
      ])
    : [
        { settings: demoLoadDashboard().settings },
        demoLoadDashboard().weights,
        demoLoadDashboard().latestWeight,
        demoLoadNotesAndPhotos().notes,
      ];
  const first = weights.at(-1);
  const delta = latest && first ? latest.weight - first.weight : null;

  return (
    <div>
      <PageHeader title="Progresso" subtitle="Peso, tendência e ocorrências. Sem diagnóstico médico." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Peso atual</p>
            <p className="mt-2 text-2xl font-semibold">{latest ? `${formatNumber(latest.weight, 1)} kg` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Peso inicial</p>
            <p className="mt-2 text-2xl font-semibold">{first ? `${formatNumber(first.weight, 1)} kg` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Mudança total</p>
            <p className="mt-2 text-2xl font-semibold">{delta == null ? "—" : `${delta > 0 ? "+" : ""}${formatNumber(delta, 1)} kg`}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        {weights.length ? (
          <ChartCard title="Peso">
            <WeightChart
              data={[...weights].reverse().map((item) => ({
                label: item.date.slice(5),
                peso: item.weight,
              }))}
            />
          </ChartCard>
        ) : (
          <EmptyState title="Você ainda não registrou seu peso hoje." actionLabel="Registrar peso" />
        )}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Ocorrências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notes.length === 0 ? <p className="text-sm text-muted">Nenhuma ocorrência registrada.</p> : null}
          {notes.map((note) => (
            <div key={note.id} className="surface-muted rounded-xl px-4 py-3">
              <p className="text-xs text-muted">
                {note.date} · {HEALTH_NOTE_LABELS[note.type]} · {note.status}
              </p>
              <p className="mt-1 text-sm">{note.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="mt-3 hidden text-xs">{settings.weekly_cardio_goal}</p>
    </div>
  );
}
