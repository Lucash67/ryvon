import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/v8";
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
            <Badge tone="neutral">Descanso</Badge>
          )
        }
      />

      <SectionHeader title="Calendário da semana" />
      <div className="grid grid-cols-2 gap-[9px] sm:grid-cols-4 lg:grid-cols-7">
        {data.templates.map((template) => (
          <div
            key={template.id}
            className="rounded-[14px] border border-border bg-surface-2 p-3 text-center"
          >
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">{template.name}</p>
            <p className="mt-1 text-[11px] text-muted">{template.is_rest ? "Off" : "Day On"}</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Templates e exercícios" />
      <div className="space-y-4">
        {data.catalog.map(({ template, exercises }) => (
          <Card key={template.id} className="hover:translate-y-0">
            <CardHeader>
              <CardTitle className="text-[17px]">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {template.is_rest ? (
                <p className="text-[11px] text-muted">Dia de descanso.</p>
              ) : (
                exercises.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[14px] border border-border bg-surface-2 p-[14px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.exercise?.name}</p>
                        <p className="mt-1 text-[11px] text-muted">
                          {item.exercise?.muscle_group} · {item.work_sets}x {item.rep_min}–{item.rep_max} · descanso {Math.round(item.rest_seconds / 60)} min
                        </p>
                      </div>
                      {item.exercise_id ? (
                        <Link href={`/treinos/exercicio/${item.exercise_id}`} className="shrink-0 text-[11px] font-semibold text-primary">
                          Histórico
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-[7px] sm:grid-cols-5">
                      {Array.from({ length: item.work_sets }).map((_, i) => (
                        <div key={i} className="rounded-lg bg-surface-3 px-2 py-[9px] text-center text-[10px] text-muted">
                          S{i + 1}
                        </div>
                      ))}
                    </div>
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
