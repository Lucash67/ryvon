import type { ExerciseSet, ProgressionKind, ProgressionResult, PreviousSetSummary } from "@/types";

function workSets(sets: ExerciseSet[]) {
  return sets.filter((set) => set.set_type === "work" && set.weight != null && set.reps != null);
}

export function bestWorkSet(sets: ExerciseSet[]): PreviousSetSummary | null {
  const valid = workSets(sets);
  if (valid.length === 0) return null;
  return [...valid].sort((a, b) => {
    if ((b.weight ?? 0) !== (a.weight ?? 0)) return (b.weight ?? 0) - (a.weight ?? 0);
    return (b.reps ?? 0) - (a.reps ?? 0);
  })[0];
}

export function sessionVolume(sets: ExerciseSet[]) {
  return workSets(sets).reduce((total, set) => total + (set.weight ?? 0) * (set.reps ?? 0), 0);
}

export function detectProgression(
  currentSets: ExerciseSet[],
  previousSets: ExerciseSet[] | null,
): ProgressionResult {
  const current = bestWorkSet(currentSets);
  const previous = previousSets ? bestWorkSet(previousSets) : null;

  if (!current || current.weight == null || current.reps == null) {
    return { kind: "hold", label: "Sem dados suficientes", previous, current };
  }
  if (!previous || previous.weight == null || previous.reps == null) {
    return { kind: "load_pr", label: "Primeira carga registrada", previous, current };
  }

  const currentVolume = sessionVolume(currentSets);
  const previousVolume = sessionVolume(previousSets ?? []);
  let kind: ProgressionKind = "hold";
  let label = "Manutenção";

  if (current.weight > previous.weight) {
    kind = "load_pr";
    label = `Carga PR · ${previous.weight}kg → ${current.weight}kg`;
  } else if (current.weight === previous.weight && current.reps > previous.reps) {
    kind = "rep_pr";
    label = `Rep PR · ${previous.weight}kg ${previous.reps} → ${current.reps} reps`;
  } else if (current.weight < previous.weight || current.reps < previous.reps) {
    kind = "drop";
    label = "Queda de performance";
  }

  if (currentVolume > previousVolume && previousVolume > 0 && kind !== "drop") {
    if (kind === "hold") {
      kind = "volume_pr";
      label = "Volume PR";
    }
  }

  return { kind, label, previous, current };
}

export function progressionBadge(kind: ProgressionKind) {
  if (kind === "rep_pr" || kind === "load_pr" || kind === "volume_pr") {
    return "Nova progressão";
  }
  return null;
}
