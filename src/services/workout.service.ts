import type { SupabaseClient } from "@supabase/supabase-js";
import { detectProgression } from "@/domain/progression";
import { isDemoMode } from "@/lib/runtime";
import { mockStore } from "@/lib/mock-store";
import type {
  Exercise,
  ExerciseSession,
  ExerciseSet,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from "@/types";

export async function listExercises(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return mockStore.listExercises();
  }
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (error || !data || data.length === 0) return mockStore.listExercises();
    return (data ?? []) as Exercise[];
  } catch {
    return mockStore.listExercises();
  }
}

export async function listTemplateExercises(supabase: SupabaseClient, templateId: string) {
  if (!isDemoMode()) {
    return mockStore.listTemplateExercises(templateId);
  }
  try {
    const { data, error } = await supabase
      .from("workout_template_exercises")
      .select("*, exercise:exercises(*)")
      .eq("template_id", templateId)
      .order("position");
    if (error || !data || data.length === 0) return mockStore.listTemplateExercises(templateId);
    return (data ?? []) as WorkoutTemplateExercise[];
  } catch {
    return mockStore.listTemplateExercises(templateId);
  }
}

export async function getWorkoutSessionForDate(supabase: SupabaseClient, userId: string, date: string) {
  if (!isDemoMode()) {
    return mockStore.getWorkoutSessionForDate(date);
  }
  try {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, template:workout_templates(*)")
      .eq("user_id", userId)
      .eq("date", date)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return mockStore.getWorkoutSessionForDate(date);
    return (data as WorkoutSession | null) ?? null;
  } catch {
    return mockStore.getWorkoutSessionForDate(date);
  }
}

export async function listWorkoutSessionsInRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  if (!isDemoMode()) {
    return mockStore.listWorkoutSessionsInRange(start, end);
  }
  try {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, template:workout_templates(*)")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end)
      .order("date");
    if (error || !data || data.length === 0) return mockStore.listWorkoutSessionsInRange(start, end);
    return (data ?? []) as WorkoutSession[];
  } catch {
    return mockStore.listWorkoutSessionsInRange(start, end);
  }
}

async function previousExerciseSets(
  supabase: SupabaseClient,
  userId: string,
  exerciseId: string,
  beforeDate: string,
) {
  if (!isDemoMode()) return [];
  try {
    const { data, error } = await supabase
      .from("exercise_sessions")
      .select("id, workout_sessions!inner(user_id, date, status), exercise_sets(*)")
      .eq("exercise_id", exerciseId)
      .eq("workout_sessions.user_id", userId)
      .eq("workout_sessions.status", "completed")
      .lt("workout_sessions.date", beforeDate)
      .order("date", { referencedTable: "workout_sessions", ascending: false })
      .limit(1);
    if (error) return [];
    const row = data?.[0] as
      | { id: string; exercise_sets: ExerciseSet[] }
      | undefined;
    return row?.exercise_sets ?? [];
  } catch {
    return [];
  }
}

export async function startWorkout(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  template: WorkoutTemplate,
  dailyLogId: string,
) {
  if (!isDemoMode()) {
    return mockStore.getWorkoutSessionForDate(date) ?? ({} as any);
  }
  try {
    const existing = await getWorkoutSessionForDate(supabase, userId, date);
    if (existing && (existing.status === "in_progress" || existing.status === "completed")) {
      return existing;
    }

    const templateExercises = template.is_rest ? [] : await listTemplateExercises(supabase, template.id);

    const sessionRes = existing
      ? await supabase
          .from("workout_sessions")
          .update({
            status: template.is_rest ? "completed" : "in_progress",
            template_id: template.id,
            daily_log_id: dailyLogId,
            started_at: new Date().toISOString(),
            label: template.name,
          })
          .eq("id", existing.id)
          .select("*, template:workout_templates(*)")
          .single()
      : await supabase
          .from("workout_sessions")
          .insert({
            user_id: userId,
            template_id: template.id,
            daily_log_id: dailyLogId,
            date,
            status: template.is_rest ? "completed" : "in_progress",
            started_at: new Date().toISOString(),
            label: template.name,
          })
          .select("*, template:workout_templates(*)")
          .single();

    if (sessionRes.error) return mockStore.getWorkoutSessionForDate(date) ?? ({} as any);
    const session = sessionRes.data as WorkoutSession;

    if (!template.is_rest) {
      const { data: already } = await supabase
        .from("exercise_sessions")
        .select("id")
        .eq("workout_session_id", session.id)
        .limit(1);
      if (!already?.length) {
        const createdSessions = await supabase
          .from("exercise_sessions")
          .insert(
            templateExercises.map((item) => ({
              workout_session_id: session.id,
              exercise_id: item.exercise_id,
              position: item.position,
              status: "pending",
            })),
          )
          .select("*");
        if (createdSessions.error) throw createdSessions.error;

        const setRows = (createdSessions.data ?? []).flatMap((exerciseSession) => {
          const meta = templateExercises.find((item) => item.exercise_id === exerciseSession.exercise_id);
          const workSets = meta?.work_sets ?? 2;
          return Array.from({ length: workSets }, (_, index) => ({
            exercise_session_id: exerciseSession.id,
            set_number: index + 1,
            set_type: "work" as const,
          }));
        });
        if (setRows.length) {
          const { error } = await supabase.from("exercise_sets").insert(setRows);
          if (error) throw error;
        }
      }
    }

    return session;
  } catch {
    return mockStore.getWorkoutSessionForDate(date) ?? ({} as any);
  }
}

export async function markWorkoutStatus(
  supabase: SupabaseClient,
  sessionId: string,
  status: WorkoutSessionStatus,
) {
  if (!isDemoMode()) return;
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getWorkoutSessionDetail(supabase: SupabaseClient, sessionId: string) {
  if (!isDemoMode()) {
    return mockStore.getWorkoutSessionDetail(sessionId);
  }
  try {
    const sessionRes = await supabase
      .from("workout_sessions")
      .select("*, template:workout_templates(*)")
      .eq("id", sessionId)
      .single();
    if (sessionRes.error) return mockStore.getWorkoutSessionDetail(sessionId);
    const session = sessionRes.data as WorkoutSession;

    const exercisesRes = await supabase
      .from("exercise_sessions")
      .select("*, exercise:exercises(*), sets:exercise_sets(*)")
      .eq("workout_session_id", sessionId)
      .order("position");
    if (exercisesRes.error) return mockStore.getWorkoutSessionDetail(sessionId);

    const exercises = ((exercisesRes.data ?? []) as ExerciseSession[]).map((item) => ({
      ...item,
      sets: (item.sets ?? []).sort((a, b) => a.set_number - b.set_number),
    }));

    return { session, exercises };
  } catch {
    return mockStore.getWorkoutSessionDetail(sessionId);
  }
}

export async function updateExerciseSet(
  supabase: SupabaseClient,
  setId: string,
  patch: Partial<Pick<ExerciseSet, "weight" | "reps" | "rir">>,
) {
  if (!isDemoMode()) return;
  const { error } = await supabase.from("exercise_sets").update(patch).eq("id", setId);
  if (error) throw error;
}

export async function completeExerciseSession(supabase: SupabaseClient, exerciseSessionId: string) {
  if (!isDemoMode()) return;
  const { error } = await supabase
    .from("exercise_sessions")
    .update({ status: "completed" })
    .eq("id", exerciseSessionId);
  if (error) throw error;
}

export async function finishWorkout(supabase: SupabaseClient, sessionId: string, durationSeconds: number) {
  if (!isDemoMode()) return;
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getExerciseHistory(
  supabase: SupabaseClient,
  userId: string,
  exerciseId: string,
  limit = 20,
) {
  if (!isDemoMode()) return [];
  try {
    const { data, error } = await supabase
      .from("exercise_sessions")
      .select("id, status, workout_sessions!inner(user_id, date, status), exercise_sets(*), exercise:exercises(*)")
      .eq("exercise_id", exerciseId)
      .eq("workout_sessions.user_id", userId)
      .eq("workout_sessions.status", "completed")
      .order("date", { referencedTable: "workout_sessions", ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function buildSessionProgressions(
  supabase: SupabaseClient,
  userId: string,
  session: WorkoutSession,
  exercises: ExerciseSession[],
) {
  const results = [];
  for (const exercise of exercises) {
    const previous = await previousExerciseSets(
      supabase,
      userId,
      exercise.exercise_id,
      session.date,
    );
    results.push({
      exerciseId: exercise.exercise_id,
      name: exercise.exercise?.name ?? "Exercício",
      previous: previous,
      progression: detectProgression(exercise.sets ?? [], previous),
    });
  }
  return results;
}

export async function updateTemplateExercise(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<WorkoutTemplateExercise, "work_sets" | "rep_min" | "rep_max" | "rest_seconds" | "instructions">>,
) {
  if (!isDemoMode()) return;
  const { error } = await supabase.from("workout_template_exercises").update(patch).eq("id", id);
  if (error) throw error;
}

export async function reorderTemplates(
  supabase: SupabaseClient,
  userId: string,
  orderedIds: string[],
) {
  if (!isDemoMode()) return;
  await Promise.all(
    orderedIds.map((id, order_index) =>
      supabase.from("workout_templates").update({ order_index }).eq("id", id).eq("user_id", userId),
    ),
  );
}

export async function getPreviousBestMap(
  supabase: SupabaseClient,
  userId: string,
  exerciseIds: string[],
  beforeDate: string,
) {
  const map = new Map<string, ExerciseSet[]>();
  if (!isDemoMode()) {
    return map;
  }
  try {
    await Promise.all(
      exerciseIds.map(async (exerciseId) => {
        map.set(exerciseId, await previousExerciseSets(supabase, userId, exerciseId, beforeDate));
      }),
    );
    return map;
  } catch {
    return map;
  }
}