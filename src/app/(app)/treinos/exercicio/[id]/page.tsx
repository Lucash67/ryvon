import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, WeightChart } from "@/components/charts/simple-charts";
import { requireSession } from "@/lib/auth";
import { getExerciseHistory } from "@/services/workout.service";
import { bestWorkSet, sessionVolume } from "@/domain/progression";
import { formatNumber } from "@/utils/dates";
import type { ExerciseSet } from "@/types";

export default async function ExerciseHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireSession();
  const history = (await getExerciseHistory(supabase, user.id, id, 24)) as unknown as Array<{
    exercise: { name: string } | null;
    workout_sessions: { date: string };
    exercise_sets: ExerciseSet[];
  }>;
  if (!history.length) {
    return (
      <div>
        <PageHeader title="Histórico do exercício" subtitle="Ainda não há séries concluídas." />
      </div>
    );
  }

  const chronological = [...history].reverse();
  const bests = chronological
    .map((item) => ({ date: item.workout_sessions.date, best: bestWorkSet(item.exercise_sets) }))
    .filter((item) => item.best?.weight != null);
  const currentPr = [...bests].sort((a, b) => (b.best?.weight ?? 0) - (a.best?.weight ?? 0) || (b.best?.reps ?? 0) - (a.best?.reps ?? 0))[0];
  const last = bests.at(-1);
  const first = bests[0];

  return (
    <div>
      <PageHeader title={history[0].exercise?.name ?? "Exercício"} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">PR atual</p>
            <p className="mt-2 text-xl font-semibold">
              {currentPr ? `${currentPr.best?.weight} kg × ${currentPr.best?.reps}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Última</p>
            <p className="mt-2 text-xl font-semibold">
              {last ? `${last.best?.weight}kg × ${last.best?.reps}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Primeira registrada</p>
            <p className="mt-2 text-xl font-semibold">
              {first ? `${first.best?.weight}kg × ${first.best?.reps}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Carga ao longo do tempo">
          <WeightChart
            data={bests.map((item) => ({
              label: item.date.slice(5),
              peso: item.best?.weight ?? 0,
            }))}
          />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Sessões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {chronological.map((item) => {
              const best = bestWorkSet(item.exercise_sets);
              return (
                <div key={`${item.workout_sessions.date}-${best?.weight}`} className="flex justify-between rounded-xl bg-[#f7f9fc] px-3 py-3 text-sm">
                  <span>{item.workout_sessions.date}</span>
                  <span>
                    {best ? `${best.weight}kg × ${best.reps}` : "—"} · vol {formatNumber(sessionVolume(item.exercise_sets))}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
