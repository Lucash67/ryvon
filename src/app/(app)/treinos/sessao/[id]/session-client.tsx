"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { RestTimer, WorkoutLiveHeader, WorkoutStickyBar } from "@/components/v8";
import { completeExerciseAction, finishWorkoutAction, saveSetAction } from "@/app/actions";
import { bestWorkSet, detectProgression, progressionBadge, sessionVolume } from "@/domain/progression";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { ExerciseSession, ExerciseSet, WorkoutSession, WorkoutTemplateExercise } from "@/types";

function formatTimer(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SessionClient({
  session,
  exercises,
  previousMap,
  templateExercises,
}: {
  session: WorkoutSession;
  exercises: ExerciseSession[];
  previousMap: Record<string, ExerciseSet[]>;
  templateExercises: WorkoutTemplateExercise[];
}) {
  const router = useRouter();
  const started = new Date(session.started_at ?? session.created_at ?? `${session.date}T00:00:00`).getTime();
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const label = session.template?.name ?? session.label ?? "Treino";

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
      setRest((value) => (value == null || value <= 0 ? null : value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  const progressions = exercises.map((exercise) =>
    detectProgression(exercise.sets ?? [], previousMap[exercise.exercise_id] ?? []),
  );

  const finish = async () => {
    setDone(true);
    await finishWorkoutAction(session.id, elapsed);
    router.push("/hoje");
  };

  return (
    <div className="pb-36 lg:pb-8">
      <WorkoutLiveHeader
        label={label}
        timer={formatTimer(elapsed)}
        restLabel={rest != null ? formatTimer(rest) : undefined}
        onStartRest={() => setRest(120)}
        onFinish={finish}
      />

      <div className="space-y-4">
        {exercises.map((exercise, index) => {
          const meta = templateExercises.find((item) => item.exercise_id === exercise.exercise_id);
          const previous = bestWorkSet(previousMap[exercise.exercise_id] ?? []);
          const progression = progressions[index];
          return (
            <Card key={exercise.id} className="hover:translate-y-0">
              <CardHeader>
                <div>
                  <CardTitle className="text-[20px] font-black">{exercise.exercise?.name}</CardTitle>
                  <p className="mt-1 text-[11px] text-muted">
                    {exercise.exercise?.muscle_group} · {meta?.work_sets}x {meta?.rep_min}–{meta?.rep_max} · descanso {Math.round((meta?.rest_seconds ?? 120) / 60)} min
                  </p>
                </div>
                {progressionBadge(progression.kind) ? <Badge tone="success">Nova progressão</Badge> : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[11px] text-muted">
                  Anterior: {previous ? `${previous.weight}kg × ${previous.reps}` : "sem histórico"}
                </p>
                {(exercise.sets ?? []).map((set) => (
                  <SetRow key={set.id} set={set} previous={previous} onComplete={() => setRest(meta?.rest_seconds ?? 120)} />
                ))}
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await completeExerciseAction(exercise.id);
                    setRest(meta?.rest_seconds ?? 120);
                  }}
                >
                  Concluir exercício
                </Button>
                <p className="text-[10px] text-muted">Volume: {sessionVolume(exercise.sets ?? [])}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rest != null ? (
        <div className="fixed inset-x-0 bottom-[calc(74px+env(safe-area-inset-bottom)+88px)] z-40 mx-auto w-[min(92%,420px)] lg:bottom-28">
          <RestTimer seconds={rest} onSkip={() => setRest(null)} />
        </div>
      ) : null}

      <WorkoutStickyBar
        label={label}
        timer={formatTimer(elapsed)}
        restLabel={rest != null ? formatTimer(rest) : undefined}
        onRest={() => setRest(120)}
        onFinish={finish}
      />

      <div className="mt-6 hidden lg:block">
        <Button className="w-full" size="lg" disabled={done} onClick={finish}>
          Finalizar treino
        </Button>
      </div>
    </div>
  );
}

function SetRow({
  set,
  previous,
  onComplete,
}: {
  set: ExerciseSet;
  previous: { weight: number | null; reps: number | null } | null;
  onComplete?: () => void;
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? previous?.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [rir, setRir] = useState(set.rir?.toString() ?? "");
  const [completed, setCompleted] = useState(false);
  const payload = useMemo(
    () => ({
      weight: weight ? Number(weight) : null,
      reps: reps ? Number(reps) : null,
      rir: rir ? Number(rir) : null,
    }),
    [weight, reps, rir],
  );
  useAutoSave(payload, async (value) => {
    await saveSetAction(set.id, value);
  }, 400);

  return (
    <div
      className={`grid grid-cols-[42px_1fr_1fr] gap-2 rounded-xl border p-[9px] sm:grid-cols-[54px_1fr_1fr_1fr_auto] ${completed ? "border-success/35 bg-success/8" : "border-border bg-surface-2"}`}
    >
      <div className="flex items-end pb-1">
        <span className="text-[10px] font-bold text-muted">S{set.set_number}</span>
      </div>
      <div>
        <Label className="text-[8px] uppercase">Carga</Label>
        <Input
          className="h-9 border-0 bg-transparent px-1 font-extrabold"
          type="number"
          inputMode="decimal"
          min="0"
          value={weight}
          disabled={completed}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <div>
        <Label className="text-[8px] uppercase">Reps</Label>
        <Input
          className="h-9 border-0 bg-transparent px-1 font-extrabold"
          type="number"
          inputMode="numeric"
          min="0"
          value={reps}
          disabled={completed}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <Label className="text-[8px] uppercase">RIR</Label>
        <Input
          className="h-9 border-0 bg-transparent px-1 font-extrabold"
          type="number"
          inputMode="decimal"
          min="0"
          max="10"
          value={rir}
          disabled={completed}
          onChange={(e) => setRir(e.target.value)}
        />
      </div>
      <div className="col-span-3 flex justify-end sm:col-span-1 sm:items-end">
        <Button
          size="sm"
          variant={completed ? "secondary" : "primary"}
          disabled={completed}
          onClick={() => {
            setCompleted(true);
            onComplete?.();
          }}
        >
          {completed ? "OK" : "Feito"}
        </Button>
      </div>
    </div>
  );
}
