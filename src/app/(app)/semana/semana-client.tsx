"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DayOverview, MetricList, MetricRow, ScoreStrip, SectionHeader } from "@/components/v8";
import { WEEKDAY_SHORT, CARDIO_LABELS, ACTIVITY_LABELS } from "@/domain/constants";
import { blockStatusLabel, verdictLabel } from "@/domain/scores";
import { formatNumber, minutesToHoursLabel, parseDate, weekRangeLabel } from "@/utils/dates";
import { PageHeader } from "@/components/layout/page-header";
import { signed } from "@/utils/format";
import type { DailyLog, FitnessSettings, Week, WorkoutSession } from "@/types";
import type { buildWeekSnapshot } from "@/services/analytics.service";

type Snapshot = ReturnType<typeof buildWeekSnapshot>;

export function SemanaClient({
  week,
  snapshot,
  prevSnapshot,
  mealMap,
  settings,
  currentWeekNumber,
}: {
  week: Week;
  snapshot: Snapshot;
  prevSnapshot: Snapshot | null;
  mealMap: Record<string, string[]>;
  settings: FitnessSettings;
  currentWeekNumber: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedLog = snapshot.logs.find((log) => log.date === selected) ?? null;

  return (
    <div>
      <PageHeader
        eyebrow={`Semana ${week.week_number}`}
        title={weekRangeLabel(week.start_date, week.end_date)}
        action={
          <div className="flex gap-2">
            {week.week_number > 1 ? (
              <Link href={`/semana?w=${week.week_number - 1}`}>
                <Button variant="outline">Anterior</Button>
              </Link>
            ) : null}
            {week.week_number < currentWeekNumber ? (
              <Link href={`/semana?w=${week.week_number + 1}`}>
                <Button variant="outline">Próxima</Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <DayOverview
        days={snapshot.logs.map((log) => {
          const workout = snapshot.workouts.find((item) => item.date === log.date);
          const cardioMin = snapshot.cardio
            .filter((item) => item.daily_log_id === log.id)
            .reduce((sum, item) => sum + item.minutes, 0);
          return {
            date: log.date,
            weekday: WEEKDAY_SHORT[parseDate(log.date).getDay()],
            dayNum: `${log.date.slice(8)}/${log.date.slice(5, 7)}`,
            metrics: [
              { label: "Sono", value: minutesToHoursLabel(log.sleep_minutes) },
              { label: "Cardio", value: `${cardioMin}m` },
              { label: "Treino", value: workout?.label ?? "—" },
              { label: "Kcal", value: String(log.calories ?? "—") },
              { label: "P", value: String(log.protein ?? "—") },
            ],
          };
        })}
        activeDate={selected ?? undefined}
        onSelect={setSelected}
        className="mb-[14px]"
      />

      <ScoreStrip
        items={[
          { label: "Geral", value: snapshot.scores.general.toFixed(1) },
          { label: "Treino", value: snapshot.scores.training.toFixed(1) },
          { label: "Nutrição", value: snapshot.scores.nutrition.toFixed(1) },
          { label: "Cardio", value: snapshot.scores.cardio.toFixed(1) },
          { label: "Sono", value: snapshot.scores.sleep.toFixed(1) },
          { label: "Rotina", value: snapshot.scores.routine.toFixed(1) },
        ]}
      />

      <SectionHeader title="Tabela da semana" />
      <Card className="overflow-x-auto hover:translate-y-0">
        <CardHeader>
          <CardTitle>Tabela da semana</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead className="text-muted">
              <tr>
                {["Dia", "Sono", "Cardio", "Horários", "Até 21h30", "Treino", "Progressão", "Atividade"].map((col) => (
                  <th key={col} className="pb-3 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.logs.map((log) => {
                const workout = snapshot.workouts.find((item) => item.date === log.date);
                const cardio = snapshot.cardio.filter((item) => item.daily_log_id === log.id);
                return (
                  <tr key={log.id} className="border-t border-border">
                    <td className="py-3">{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</td>
                    <td>{minutesToHoursLabel(log.sleep_minutes)}</td>
                    <td>{cardio.map((item) => `${item.minutes} ${CARDIO_LABELS[item.type]}`).join(", ") || "0"}</td>
                    <td>{(mealMap[log.date] ?? []).join(" · ") || "—"}</td>
                    <td>{log.meal_cutoff_hit == null ? "—" : log.meal_cutoff_hit ? "SIM" : "NÃO"}</td>
                    <td>{workout?.label ?? "—"}</td>
                    <td>{workout?.status === "completed" ? "ok" : workout?.status ?? "—"}</td>
                    <td>{log.activity_level ? ACTIVITY_LABELS[log.activity_level] : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <CardHeader>
          <CardTitle>Nutrição</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                {["Dia", "Calorias", "Carboidratos", "Proteínas", "Gorduras"].map((col) => (
                  <th key={col} className="pb-3 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.logs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="py-3">{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</td>
                  <td>{log.calories ?? "—"}</td>
                  <td>{log.carbs ?? "—"}</td>
                  <td>{log.protein ?? "—"}</td>
                  <td>{log.fat ?? "—"}</td>
                </tr>
              ))}
              <tr className="border-t border-border font-semibold">
                <td className="py-3">TOTAL</td>
                <td>{formatNumber(snapshot.summary.calories_total)}</td>
                <td>{formatNumber((snapshot.summary.carbs_avg ?? 0) * snapshot.summary.days_logged)}</td>
                <td>{formatNumber((snapshot.summary.protein_avg ?? 0) * snapshot.summary.days_logged)}</td>
                <td>{formatNumber((snapshot.summary.fat_avg ?? 0) * snapshot.summary.days_logged)}</td>
              </tr>
              <tr className="text-muted">
                <td className="py-3">MÉDIA</td>
                <td>{formatNumber(snapshot.summary.calories_avg)}</td>
                <td>{formatNumber(snapshot.summary.carbs_avg)}</td>
                <td>{formatNumber(snapshot.summary.protein_avg)}</td>
                <td>{formatNumber(snapshot.summary.fat_avg)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-[14px] lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle>Resumo semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricList>
              <MetricRow label="Calorias totais" value={formatNumber(snapshot.summary.calories_total)} />
              <MetricRow label="Média diária" value={formatNumber(snapshot.summary.calories_avg)} />
              <MetricRow label="Proteína média" value={`${formatNumber(snapshot.summary.protein_avg)} g`} />
              <MetricRow label="Sono médio" value={minutesToHoursLabel(snapshot.summary.sleep_avg_minutes)} />
              <MetricRow label="Cardio total" value={`${snapshot.summary.cardio_total} min`} />
              <MetricRow label="Treinos" value={`${snapshot.summary.workouts_completed}/${snapshot.summary.workouts_planned}`} />
              <MetricRow label="Peso semanal" value={snapshot.summary.weekly_weight ? `${formatNumber(snapshot.summary.weekly_weight, 1)} kg` : "—"} />
            </MetricList>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Veredito da semana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{verdictLabel(snapshot.verdict)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Row label="Execução" value={snapshot.scores.general.toFixed(1)} />
              <Row label="Treino" value={snapshot.scores.training.toFixed(1)} />
              <Row label="Nutrição" value={snapshot.scores.nutrition.toFixed(1)} />
              <Row label="Cardio" value={snapshot.scores.cardio.toFixed(1)} />
              <Row label="Sono" value={snapshot.scores.sleep.toFixed(1)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(snapshot.status).map(([key, status]) => (
                <Badge key={key} tone={status === "on_track" ? "success" : status === "attention" ? "warning" : "danger"}>
                  {key}: {blockStatusLabel(status)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {prevSnapshot ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Comparação com a semana anterior</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Compare label="Peso" current={snapshot.summary.weekly_weight} previous={prevSnapshot.summary.weekly_weight} suffix=" kg" />
            <Compare label="Sono" current={snapshot.summary.sleep_avg_minutes} previous={prevSnapshot.summary.sleep_avg_minutes} suffix=" min" />
            <Compare label="Cardio" current={snapshot.summary.cardio_total} previous={prevSnapshot.summary.cardio_total} suffix=" min" />
            <Compare label="Proteína" current={snapshot.summary.protein_avg} previous={prevSnapshot.summary.protein_avg} suffix=" g" />
            <Compare
              label="Treino"
              current={snapshot.summary.workouts_completed}
              previous={prevSnapshot.summary.workouts_completed}
              suffix={`/${snapshot.summary.workouts_planned}`}
            />
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={!!selectedLog} onClose={() => setSelected(null)} title="Editar dia">
        {selectedLog ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">Abra o dia em Hoje para edição completa, ou ajuste rápido pelo Registrar.</p>
            <Link href={`/hoje?date=${selectedLog.date}`}>
              <Button className="w-full">Abrir este dia</Button>
            </Link>
          </div>
        ) : null}
      </Dialog>
      <p className="mt-4 hidden text-xs text-muted">{settings.meal_cutoff_time}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Compare({
  label,
  current,
  previous,
  suffix,
}: {
  label: string;
  current: number | null | undefined;
  previous: number | null | undefined;
  suffix: string;
}) {
  const delta = current != null && previous != null ? current - previous : null;
  return (
    <div className="surface-muted rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold">
        {current == null ? "—" : `${formatNumber(current, suffix.includes("kg") ? 1 : 0)}${suffix}`}
      </p>
      <p className="text-sm text-muted">
        vs {previous == null ? "—" : `${formatNumber(previous, suffix.includes("kg") ? 1 : 0)}${suffix}`}
      </p>
      {delta != null ? (
        <p className={`mt-1 text-sm ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted"}`}>
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "="} {signed(delta, suffix, suffix.includes("kg") ? 1 : 0)}
        </p>
      ) : null}
    </div>
  );
}

export type { WorkoutSession, DailyLog };
