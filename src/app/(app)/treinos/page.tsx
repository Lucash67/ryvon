import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { loadTrainingModule } from "@/services/loaders";
import { redirect } from "next/navigation";
import { todayDateString, weekRangeLabel } from "@/utils/dates";
import { plannedTemplateForDate } from "@/domain/week";

export default async function TreinosPage() {
  const { supabase, user } = await requireSession();
  const data = await loadTrainingModule(supabase, user.id);
  const today = todayDateString();
  const planned = plannedTemplateForDate(today, data.settings.cycle_start_date, data.templates);

  return (
    <div>
      <PageHeader
        title="Treinos"
        subtitle={`Semana ${data.week.week_number} · ${weekRangeLabel(data.week.start_date, data.week.end_date)}`}
        action={
          planned && !planned.is_rest ? (
            <form
              action={async () => {
                "use server";
                const { startWorkoutAction: start } = await import("@/app/actions");
                const session = await start(today);
                redirect(`/treinos/sessao/${session.id}`);
              }}
            >
              <Button type="submit">Iniciar {planned.name}</Button>
            </form>
          ) : (
            <Badge>Descanso</Badge>
          )
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Calendário da semana</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.templates.map((template) => (
            <div key={template.id} className="surface-muted rounded-xl px-4 py-3">
              <p className="text-sm font-semibold">{template.name}</p>
              <p className="text-xs text-muted">{template.is_rest ? "Off" : "Day On"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data.catalog.map(({ template, exercises }) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {template.is_rest ? (
                <p className="text-sm text-muted">Dia de descanso.</p>
              ) : (
                exercises.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
                    <div>
                      <p className="font-medium">{item.exercise?.name}</p>
                      <p className="text-xs text-muted">
                        {item.work_sets}x {item.rep_min}–{item.rep_max} · descanso {Math.round(item.rest_seconds / 60)} min
                      </p>
                    </div>
                    {item.exercise_id ? (
                      <Link href={`/treinos/exercicio/${item.exercise_id}`} className="text-sm text-primary">
                        Histórico
                      </Link>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
