"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  addCardioAction,
  markWorkoutStatusAction,
  removeCardioAction,
  saveDailyLogAction,
  saveMealTimesAction,
  startWorkoutAction,
} from "@/app/actions";
import { CARDIO_LABELS, CARDIO_TIMING_LABELS } from "@/domain/constants";
import { calculateSleepMinutes } from "@/domain/sleep";
import { targetsForDay } from "@/domain/adherence";
import { useAutoSave } from "@/hooks/use-auto-save";
import { formatLongDate, formatNumber, formatWeekday, minutesToHoursLabel } from "@/utils/dates";
import { signed } from "@/utils/format";
import type {
  ActivityLevel,
  CardioSession,
  CardioTiming,
  CardioType,
  DailyLog,
  FitnessSettings,
  MealTime,
  WorkoutSession,
  WorkoutTemplate,
} from "@/types";

type Props = {
  date: string;
  log: DailyLog;
  meals: MealTime[];
  cardio: CardioSession[];
  session: WorkoutSession | null;
  planned: WorkoutTemplate | null;
  settings: FitnessSettings;
};

export function HojeClient({ date, log, meals, cardio, session, planned, settings }: Props) {
  const router = useRouter();
  const [sleepStart, setSleepStart] = useState(log.sleep_start?.slice(0, 5) ?? "");
  const [sleepEnd, setSleepEnd] = useState(log.sleep_end?.slice(0, 5) ?? "");
  const [sleepQuality, setSleepQuality] = useState(log.sleep_quality?.toString() ?? "");
  const [calories, setCalories] = useState(log.calories?.toString() ?? "");
  const [protein, setProtein] = useState(log.protein?.toString() ?? "");
  const [carbs, setCarbs] = useState(log.carbs?.toString() ?? "");
  const [fat, setFat] = useState(log.fat?.toString() ?? "");
  const [activity, setActivity] = useState<ActivityLevel | "">(log.activity_level ?? "");
  const [notes, setNotes] = useState(log.notes ?? "");
  const [times, setTimes] = useState(meals.map((meal) => meal.time.slice(0, 5)));
  const [cutoffHit, setCutoffHit] = useState<boolean | null>(log.meal_cutoff_hit);

  const sleepMinutes = calculateSleepMinutes(sleepStart || null, sleepEnd || null);
  const targets = targetsForDay(
    planned?.is_rest ? "off" : log.day_type,
    {
      calories: settings.on_calories,
      protein: settings.on_protein,
      carbs: settings.on_carbs,
      fat: settings.on_fat,
    },
    {
      calories: settings.off_calories,
      protein: settings.off_protein,
      carbs: settings.off_carbs,
      fat: settings.off_fat,
    },
  );

  const payload = useMemo(
    () => ({
      sleep_start: sleepStart || null,
      sleep_end: sleepEnd || null,
      sleep_quality: sleepQuality ? Number(sleepQuality) : null,
      calories: calories ? Number(calories) : null,
      protein: protein ? Number(protein) : null,
      carbs: carbs ? Number(carbs) : null,
      fat: fat ? Number(fat) : null,
      activity_level: activity || null,
      notes,
      meal_cutoff_hit: cutoffHit,
      last_meal_at: times.at(-1) ?? null,
    }),
    [sleepStart, sleepEnd, sleepQuality, calories, protein, carbs, fat, activity, notes, cutoffHit, times],
  );

  const saveState = useAutoSave(payload, async (value) => {
    await saveDailyLogAction(date, value);
  });

  useAutoSave(times, async (value) => {
    await saveMealTimesAction(date, value);
  }, 800);

  const dayOn = (planned ? !planned.is_rest : log.day_type === "on");

  return (
    <div>
      <PageHeader
        eyebrow={formatWeekday(date)}
        title={formatLongDate(date)}
        saveState={saveState}
        action={<Badge tone={dayOn ? "primary" : "neutral"}>{dayOn ? "DAY ON" : "DAY OFF"}</Badge>}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sono</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Dormiu</Label>
              <Input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
            </div>
            <div>
              <Label>Acordou</Label>
              <Input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
            </div>
            <div>
              <Label>Qualidade</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSleepQuality(String(value))}
                    className={`h-11 min-w-[44px] flex-1 rounded-xl border ${sleepQuality === String(value) ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted sm:col-span-3">
              Total: {minutesToHoursLabel(sleepMinutes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cardio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cardio.map((item) => (
              <div key={item.id} className="surface-muted flex items-center justify-between rounded-xl px-3 py-3">
                <p className="text-sm">
                  {CARDIO_LABELS[item.type]} · {item.minutes} min · RPE {item.rpe ?? "—"}
                </p>
                <button className="text-sm text-danger" onClick={() => removeCardioAction(item.id)}>
                  Remover
                </button>
              </div>
            ))}
            <form
              className="grid gap-3 sm:grid-cols-2"
              action={async (formData) => {
                await addCardioAction(date, {
                  type: String(formData.get("type")) as CardioType,
                  minutes: Number(formData.get("minutes")),
                  rpe: Number(formData.get("rpe")),
                  timing: String(formData.get("timing")) as CardioTiming,
                  notes: String(formData.get("notes") || "") || null,
                });
              }}
            >
              <div>
                <Label>Modalidade</Label>
                <select name="type" className="h-11 w-full rounded-xl border border-border px-3">
                  {Object.entries(CARDIO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Input name="minutes" type="number" inputMode="numeric" min="1" required />
              </div>
              <div>
                <Label>RPE</Label>
                <Input name="rpe" type="number" inputMode="numeric" min="1" max="10" defaultValue="8" />
              </div>
              <div>
                <Label>Horário</Label>
                <select name="timing" className="h-11 w-full rounded-xl border border-border px-3">
                  {Object.entries(CARDIO_TIMING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Observação</Label>
                <Input name="notes" />
              </div>
              <Button type="submit">Adicionar sessão</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refeições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {times.map((time, index) => (
              <div key={`${time}-${index}`} className="flex gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const next = [...times];
                    next[index] = e.target.value;
                    setTimes(next);
                  }}
                />
                <Button variant="outline" onClick={() => setTimes(times.filter((_, i) => i !== index))}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setTimes([...times, "12:00"])}>
              Adicionar horário
            </Button>
            <p className="text-sm text-muted">Última refeição: {times.at(-1) ?? "—"}</p>
            <div>
              <Label>Comeu até {settings.meal_cutoff_time.slice(0, 5)}?</Label>
              <div className="mt-2 flex gap-2">
                <Button variant={cutoffHit === true ? "primary" : "outline"} onClick={() => setCutoffHit(true)}>
                  SIM
                </Button>
                <Button variant={cutoffHit === false ? "primary" : "outline"} onClick={() => setCutoffHit(false)}>
                  NÃO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrição</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <MacroField label="Calorias" value={calories} onChange={setCalories} target={targets.calories} unit="kcal" />
            <MacroField label="Proteína" value={protein} onChange={setProtein} target={targets.protein} unit="g" />
            <MacroField label="Carboidratos" value={carbs} onChange={setCarbs} target={targets.carbs} unit="g" />
            <MacroField label="Gorduras" value={fat} onChange={setFat} target={targets.fat} unit="g" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{planned?.name ?? "Sem programação"}</p>
            {planned?.is_rest ? (
              <Badge>DESCANSO</Badge>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    const next = await startWorkoutAction(date);
                    router.push(`/treinos/sessao/${next.id}`);
                  }}
                >
                  {session?.status === "in_progress" ? "Continuar treino" : "Iniciar treino"}
                </Button>
                {["missed", "rescheduled", "extra_rest"].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    onClick={async () => {
                      const next = session ?? (await startWorkoutAction(date));
                      await markWorkoutStatusAction(next.id, status as "missed", date);
                    }}
                  >
                    {status === "missed" ? "Perdido" : status === "rescheduled" ? "Remarcado" : "Descanso extra"}
                  </Button>
                ))}
              </div>
            )}
            {session ? <p className="text-sm text-muted">Status: {session.status}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nível de atividade</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {([
              ["low", "Baixo"],
              ["medium", "Médio"],
              ["high", "Alto"],
            ] as const).map(([value, label]) => (
              <Button key={value} variant={activity === value ? "primary" : "outline"} onClick={() => setActivity(value)}>
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações do dia</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como foi o dia?" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MacroField({
  label,
  value,
  onChange,
  target,
  unit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  target: number;
  unit: string;
}) {
  const numeric = value ? Number(value) : null;
  const delta = numeric == null ? null : numeric - target;
  return (
    <div>
      <Label>
        {label} · {value || "—"} / {formatNumber(target)} {unit}
      </Label>
      <Input type="number" inputMode="decimal" min="0" value={value} onChange={(e) => onChange(e.target.value)} />
      {delta != null ? (
        <p className={`mt-1 text-xs ${delta === 0 ? "text-muted" : delta > 0 ? "text-warning" : "text-primary"}`}>
          {signed(delta, unit === "kcal" ? " kcal" : ` ${unit}`)}
        </p>
      ) : null}
    </div>
  );
}
