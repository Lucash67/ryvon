import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CaloriesChart,
  ChartCard,
  MacrosChart,
  SleepChart,
  WeightChart,
} from "@/components/charts/simple-charts";
import {
  HeroSection,
  MetricCard,
  MetricList,
  MetricRow,
  MiniBarChart,
  ReportInsightCard,
  ScoreStrip,
  SectionHeader,
  StatusTile,
  WeekOrbit,
} from "@/components/v8";
import { requireSession } from "@/lib/auth";
import { dashboardInsights } from "@/services/analytics.service";
import { loadDashboard } from "@/services/loaders";
import { formatLongDate, formatNumber, minutesToHoursLabel, parseDate, todayDateString, weekRangeLabel } from "@/utils/dates";
import { pct, scoreLabel } from "@/utils/format";
import { visualCap } from "@/domain/adherence";
import { blockStatusLabel } from "@/domain/scores";
import { WEEKDAY_SHORT } from "@/domain/constants";
import { targetsForDay } from "@/domain/adherence";

const STATUS_LABELS: Record<string, string> = {
  training: "Treino",
  cardio: "Cardio",
  sleep: "Sono",
  nutrition: "Nutrição",
};

export default async function DashboardPage() {
  const { supabase, user } = await requireSession();
  const data = await loadDashboard(supabase, user.id);
  const insights = await dashboardInsights(data.snapshot, data.prevSnapshot, data.settings);
  const currentWeight = data.latestWeight?.weight ?? data.snapshot.summary.weekly_weight;
  const logs = data.snapshot.logs;
  const calories = logs.map((log) => {
    const target = targetsForDay(
      log.day_type,
      {
        calories: data.settings.on_calories,
        protein: data.settings.on_protein,
        carbs: data.settings.on_carbs,
        fat: data.settings.on_fat,
      },
      {
        calories: data.settings.off_calories,
        protein: data.settings.off_protein,
        carbs: data.settings.off_carbs,
        fat: data.settings.off_fat,
      },
    );
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

  const weekDays = logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()].slice(0, 3),
    active: log.date === todayDateString(),
    done: Boolean(log.calories || log.sleep_minutes),
  }));

  const scores = data.snapshot.scores;
  const adherence = data.snapshot.adherence;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Olá, ${data.profile.name}`}
        subtitle={`${formatLongDate(new Date())} · Semana ${data.week.week_number} · ${weekRangeLabel(data.week.start_date, data.week.end_date)}`}
      />

      <HeroSection
        title="Evolução em movimento."
        subtitle="Seu painel operacional de evolução física — disciplina, dados e progressão real."
        aside={<WeekOrbit days={weekDays.length ? weekDays : WEEKDAY_SHORT.map((d) => ({ label: d.slice(0, 3) }))} />}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Peso" value={currentWeight ? `${formatNumber(currentWeight, 1)} kg` : "—"} />
        <MetricCard
          label="Treinos"
          value={`${data.snapshot.summary.workouts_completed}/${data.snapshot.summary.workouts_planned}`}
        />
        <MetricCard
          label="Cardio"
          value={`${data.snapshot.summary.cardio_total} min`}
          sub={`Meta ${data.settings.weekly_cardio_goal} min`}
        />
        <MetricCard label="Sono" value={minutesToHoursLabel(data.snapshot.summary.sleep_avg_minutes)} sub="média semanal" />
        <MetricCard
          label="Proteína"
          value={data.snapshot.summary.protein_avg ? `${formatNumber(data.snapshot.summary.protein_avg)} g` : "—"}
          sub="média diária"
        />
        <MetricCard label="Semana" value={scoreLabel(scores.general)} sub={`Aderência ${pct(visualCap(adherence.general))}`} />
      </div>

      <SectionHeader title="Visão longitudinal" subtitle="Peso e resumo operacional" />
      <div className="grid gap-[14px] lg:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="Peso">
          <WeightChart data={weightSeries} />
        </ChartCard>
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Resumo da semana</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricList>
              <MetricRow label="Média calórica" value={data.snapshot.summary.calories_avg ? `${formatNumber(data.snapshot.summary.calories_avg)} kcal` : "—"} />
              <MetricRow label="Proteína média" value={data.snapshot.summary.protein_avg ? `${formatNumber(data.snapshot.summary.protein_avg)} g` : "—"} />
              <MetricRow label="Cardio acumulado" value={`${data.snapshot.summary.cardio_total} min`} />
              <MetricRow label="Treinos concluídos" value={`${data.snapshot.summary.workouts_completed}/${data.snapshot.summary.workouts_planned}`} />
            </MetricList>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Operação da semana" subtitle="Consumo, macros, sono e cardio" />
      <div className="grid gap-[14px] md:grid-cols-2">
        <Card className="hover:translate-y-0">
          <CardHeader><CardTitle className="text-[17px]">Calorias</CardTitle></CardHeader>
          <CardContent className="h-[190px]">
            <MiniBarChart data={calories.map((c) => ({ label: c.label, value: c.consumido }))} />
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader><CardTitle className="text-[17px]">Proteína</CardTitle></CardHeader>
          <CardContent className="h-[190px]">
            <MiniBarChart data={macros.map((m) => ({ label: m.label, value: m.proteína, color: "var(--success)" }))} />
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader><CardTitle className="text-[17px]">Sono</CardTitle></CardHeader>
          <CardContent className="h-[190px]">
            <MiniBarChart data={sleep.map((s) => ({ label: s.label, value: s.horas, color: "var(--accent)" }))} max={10} />
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader><CardTitle className="text-[17px]">Cardio</CardTitle></CardHeader>
          <CardContent className="h-[190px]">
            <MiniBarChart data={cardio.map((c) => ({ label: c.label, value: c.minutos }))} />
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Status & score" />
      <Card className="hover:translate-y-0">
        <CardContent className="space-y-3 pt-5">
          <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-4">
            {Object.entries(data.snapshot.status).map(([key, status]) => (
              <StatusTile
                key={key}
                label={STATUS_LABELS[key] ?? key}
                statusLabel={blockStatusLabel(status)}
                tone={status === "on_track" ? "success" : status === "attention" ? "warning" : "danger"}
              />
            ))}
          </div>
          <ScoreStrip
            items={[
              { label: "Geral", value: scoreLabel(scores.general) },
              { label: "Treino", value: scoreLabel(scores.training) },
              { label: "Nutrição", value: scoreLabel(scores.nutrition) },
              { label: "Cardio", value: scoreLabel(scores.cardio) },
              { label: "Sono", value: scoreLabel(scores.sleep) },
              { label: "Rotina", value: scoreLabel(scores.routine) },
            ]}
          />
        </CardContent>
      </Card>

      <SectionHeader title="Gráficos detalhados" />
      <div className="grid gap-[14px] lg:grid-cols-2">
        <ChartCard title="Calorias · consumido x planejado">
          <CaloriesChart data={calories} />
        </ChartCard>
        <ChartCard title="Macros">
          <MacrosChart data={macros} />
        </ChartCard>
        <ChartCard title="Sono">
          <SleepChart data={sleep} />
        </ChartCard>
      </div>

      <SectionHeader title="RYVON Intelligence" subtitle="Leituras automáticas da semana" />
      <div className="grid gap-[14px] md:grid-cols-2 xl:grid-cols-3">
        {insights.length ? (
          insights.map((item) => <ReportInsightCard key={item} title="Insight" body={item} />)
        ) : (
          <ReportInsightCard title="Sem insights ainda" body="Registre o dia para gerar leituras automáticas da semana." />
        )}
      </div>
    </div>
  );
}
