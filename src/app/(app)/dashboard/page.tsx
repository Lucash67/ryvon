import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CaloriesChart,
  CardioChart,
  ChartCard,
  MacrosChart,
  SleepChart,
  WeightChart,
} from "@/components/charts/simple-charts";
import { requireSession } from "@/lib/auth";
import { dashboardInsights } from "@/services/analytics.service";
import { loadDashboard } from "@/services/loaders";
import { formatLongDate, formatNumber, minutesToHoursLabel, weekRangeLabel } from "@/utils/dates";
import { pct, scoreLabel } from "@/utils/format";
import { visualCap } from "@/domain/adherence";
import { blockStatusLabel } from "@/domain/scores";
import { WEEKDAY_SHORT } from "@/domain/constants";
import { parseDate } from "@/utils/dates";
import { targetsForDay } from "@/domain/adherence";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { supabase, user } = await requireSession();
  const data = await loadDashboard(supabase, user.id);
  const insights = await dashboardInsights(data.snapshot, data.prevSnapshot, data.settings);
  const currentWeight = data.latestWeight?.weight ?? data.snapshot.summary.weekly_weight;
  const logs = data.snapshot.logs;
  const calories = logs.map((log) => {
    const target = targetsForDay(log.day_type, {
      calories: data.settings.on_calories,
      protein: data.settings.on_protein,
      carbs: data.settings.on_carbs,
      fat: data.settings.on_fat,
    }, {
      calories: data.settings.off_calories,
      protein: data.settings.off_protein,
      carbs: data.settings.off_carbs,
      fat: data.settings.off_fat,
    });
    return {
      label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
      consumido: log.calories ?? 0,
      planejado: target.calories,
    };
  });
  const macros = logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
    proteína: log.protein ?? 0,
    carbo: log.carbs ?? 0,
    gordura: log.fat ?? 0,
  }));
  const sleep = logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
    horas: log.sleep_minutes ? Number((log.sleep_minutes / 60).toFixed(1)) : 0,
  }));
  const cardio = logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
    minutos: data.snapshot.cardio
      .filter((item) => ("daily_logs" in item ? item.daily_logs?.date === log.date : false) || item.daily_log_id === log.id)
      .reduce((sum, item) => sum + item.minutes, 0),
  }));
  const weightSeries = [...data.weights]
    .reverse()
    .map((item) => ({ label: item.date.slice(5).replace("-", "/"), peso: item.weight }));

  return (
    <div>
      <PageHeader
        title={`Olá, ${data.profile.name}`}
        subtitle={`${formatLongDate(new Date())} · Semana ${data.week.week_number} · ${weekRangeLabel(data.week.start_date, data.week.end_date)}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Peso atual" value={currentWeight ? `${formatNumber(currentWeight, 1)} kg` : "—"} />
        <Kpi
          label="Média calórica"
          value={data.snapshot.summary.calories_avg ? `${formatNumber(data.snapshot.summary.calories_avg)} kcal` : "—"}
        />
        <Kpi
          label="Proteína média"
          value={data.snapshot.summary.protein_avg ? `${formatNumber(data.snapshot.summary.protein_avg)} g/dia` : "—"}
        />
        <Kpi
          label="Cardio realizado"
          value={`${data.snapshot.summary.cardio_total} / ${data.settings.weekly_cardio_goal} min`}
        />
        <Kpi
          label="Treinos concluídos"
          value={`${data.snapshot.summary.workouts_completed} / ${data.snapshot.summary.workouts_planned}`}
        />
        <Kpi label="Sono médio" value={minutesToHoursLabel(data.snapshot.summary.sleep_avg_minutes)} />
        <Kpi label="Aderência geral" value={pct(visualCap(data.snapshot.adherence.general))} />
        <Kpi label="Score da semana" value={scoreLabel(data.snapshot.scores.general)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Peso">
          <WeightChart data={weightSeries} />
        </ChartCard>
        <ChartCard title="Calorias · consumido x planejado">
          <CaloriesChart data={calories} />
        </ChartCard>
        <ChartCard title="Macros">
          <MacrosChart data={macros} />
        </ChartCard>
        <ChartCard title="Sono">
          <SleepChart data={sleep} />
        </ChartCard>
        <ChartCard title="Cardio acumulado">
          <CardioChart data={cardio} />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Status da semana</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {Object.entries(data.snapshot.status).map(([key, status]) => (
              <div key={key} className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-xs uppercase tracking-wide text-muted">{key}</p>
                <div className="mt-2">
                  <Badge
                    tone={status === "on_track" ? "success" : status === "attention" ? "warning" : "danger"}
                  >
                    {blockStatusLabel(status)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Últimos insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.length ? (
            insights.map((item) => (
              <p key={item} className="rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm">
                {item}
              </p>
            ))
          ) : (
            <p className="text-sm text-muted">Registre o dia para gerar insights automáticos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
