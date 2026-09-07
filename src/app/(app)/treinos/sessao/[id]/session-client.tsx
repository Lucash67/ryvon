"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
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

  return (
    <div className="pb-28">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted">TREINO</p>
        <h1 className="mt-1 text-2xl font-semibold">{session.template?.name ?? session.label}</h1>
        <p className="mt-3 font-mono text-5xl font-semibold tracking-tight">{formatTimer(elapsed)}</p>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => {
          const meta = templateExercises.find((item) => item.exercise_id === exercise.exercise_id);
          const previous = bestWorkSet(previousMap[exercise.exercise_id] ?? []);
          const progression = progressions[index];
          return (
            <Card key={exercise.id}>
              <CardHeader>
                <div>
                  <CardTitle>{exercise.exercise?.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted">
                    {exercise.exercise?.muscle_group} · meta {meta?.rep_min}–{meta?.rep_max}
                  </p>
                </div>
                {progressionBadge(progression.kind) ? <Badge tone="success">Nova progressão</Badge> : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted">
                  Anterior: {previous ? `${previous.weight}kg × ${previous.reps}` : "sem histórico"}
                </p>
                {(exercise.sets ?? []).map((set) => (
                  <SetRow key={set.id} set={set} previous={previous} />
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
                <p className="text-xs text-muted">Volume: {sessionVolume(exercise.sets ?? [])}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rest != null ? (
        <div className="fixed inset-x-0 bottom-24 z-40 mx-auto w-[min(92%,420px)] rounded-2xl bg-[#0A1838] px-5 py-4 text-white shadow-xl lg:bottom-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Descanso</p>
              <p className="font-mono text-3xl">{formatTimer(rest)}</p>
            </div>
            <Button variant="secondary" onClick={() => setRest(null)}>
              Pular
            </Button>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
        <Button
          className="w-full"
          size="lg"
          disabled={done}
          onClick={async () => {
            setDone(true);
            await finishWorkoutAction(session.id, elapsed);
            router.push("/hoje");
          }}
        >
          Finalizar treino
        </Button>
      </div>
    </div>
  );
}

function SetRow({ set, previous }: { set: ExerciseSet; previous: { weight: number | null; reps: number | null } | null }) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? previous?.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [rir, setRir] = useState(set.rir?.toString() ?? "");
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
    <div className="rounded-xl bg-[#f7f9fc] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Work set {set.set_number}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Carga</Label>
          <Input type="number" inputMode="decimal" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div>
          <Label>Reps</Label>
          <Input type="number" inputMode="numeric" min="0" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <div>
          <Label>RIR</Label>
          <Input type="number" inputMode="decimal" min="0" max="10" value={rir} onChange={(e) => setRir(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
