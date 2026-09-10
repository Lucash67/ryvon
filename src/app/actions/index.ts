"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cardioSchema, healthNoteSchema, nutritionSchema, settingsSchema, weightSchema } from "@/lib/validations/daily";
import { isSupabaseConfigured, requireUser } from "@/lib/supabase/server";
import { getSettings, updateProfileName, updateSettings } from "@/services/settings.service";
import {
  addCardioSession,
  deleteCardioSession,
  deriveMealCutoff,
  getOrCreateDailyLog,
  listMealTimes,
  listTemplates,
  replaceMealTimes,
  updateDailyLog,
} from "@/services/daily-log.service";
import {
  addHealthNote,
  addPhoto,
  updateHealthNote,
  upsertWeightLog,
} from "@/services/entries.service";
import {
  completeExerciseSession,
  finishWorkout,
  markWorkoutStatus,
  startWorkout,
  updateExerciseSet,
  updateTemplateExercise,
} from "@/services/workout.service";
import { plannedTemplateForDate } from "@/domain/week";
import { isAuthDisabled } from "@/lib/flags";
import {
  demoAddCardio,
  demoAddNote,
  demoCompleteExercise,
  demoFinishWorkout,
  demoMarkWorkout,
  demoRemoveCardio,
  demoReplaceMeals,
  demoStartWorkout,
  demoUpdateDailyLog,
  demoUpdateSet,
  demoUpdateSettings,
  demoUpdateTemplateExercise,
  demoUpsertWeight,
} from "@/services/demo-state";
import type { CardioSession, DailyLogPatch, HealthNote, WorkoutSessionStatus } from "@/types";

function useDemo() {
  return !isSupabaseConfigured();
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveDailyLogAction(date: string, patch: DailyLogPatch) {
  if (useDemo()) {
    const log = demoUpdateDailyLog(date, patch);
    refresh();
    return log;
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  const log = await updateDailyLog(supabase, user.id, date, settings, patch);
  refresh();
  return log;
}

export async function saveNutritionAction(date: string, values: unknown) {
  const parsed = nutritionSchema.parse(values);
  return saveDailyLogAction(date, parsed);
}

export async function saveMealTimesAction(date: string, times: string[]) {
  if (useDemo()) {
    demoReplaceMeals(date, times);
    const derived = deriveMealCutoff(times, "21:30");
    demoUpdateDailyLog(date, { last_meal_at: derived.lastMeal, meal_cutoff_hit: derived.hit });
    refresh();
    return;
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  const log = await getOrCreateDailyLog(supabase, user.id, date, settings);
  await replaceMealTimes(supabase, log.id, times);
  const derived = deriveMealCutoff(times, settings.meal_cutoff_time.slice(0, 5));
  await updateDailyLog(supabase, user.id, date, settings, {
    last_meal_at: derived.lastMeal,
    meal_cutoff_hit: derived.hit,
  });
  refresh();
}

export async function addCardioAction(
  date: string,
  payload: Pick<CardioSession, "type" | "minutes" | "rpe" | "timing" | "notes">,
) {
  const parsed = cardioSchema.parse(payload);
  if (useDemo()) {
    const session = demoAddCardio(date, {
      ...parsed,
      rpe: parsed.rpe ?? null,
      notes: parsed.notes ?? null,
    });
    refresh();
    return session;
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  const log = await getOrCreateDailyLog(supabase, user.id, date, settings);
  const session = await addCardioSession(supabase, user.id, log.id, {
    ...parsed,
    rpe: parsed.rpe ?? null,
    notes: parsed.notes ?? null,
  });
  refresh();
  return session;
}

export async function removeCardioAction(id: string) {
  if (useDemo()) {
    demoRemoveCardio(id);
    refresh();
    return;
  }
  const { supabase } = await requireUser();
  await deleteCardioSession(supabase, id);
  refresh();
}

export async function saveWeightAction(values: unknown) {
  const parsed = weightSchema.parse(values);
  if (useDemo()) {
    const log = demoUpsertWeight({ ...parsed, notes: parsed.notes ?? null });
    refresh();
    return log;
  }
  const { supabase, user } = await requireUser();
  const log = await upsertWeightLog(supabase, user.id, {
    ...parsed,
    notes: parsed.notes ?? null,
  });
  refresh();
  return log;
}

export async function saveHealthNoteAction(values: unknown) {
  const parsed = healthNoteSchema.parse(values);
  if (useDemo()) {
    const note = demoAddNote(parsed);
    refresh();
    return note;
  }
  const { supabase, user } = await requireUser();
  const note = await addHealthNote(supabase, user.id, parsed);
  refresh();
  return note;
}

export async function updateHealthNoteAction(id: string, patch: Partial<Pick<HealthNote, "status" | "note">>) {
  if (useDemo()) {
    refresh();
    return;
  }
  const { supabase } = await requireUser();
  await updateHealthNote(supabase, id, patch);
  refresh();
}

export async function startWorkoutAction(date: string) {
  if (useDemo()) {
    const session = demoStartWorkout(date);
    refresh();
    return session;
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  const templates = await listTemplates(supabase, user.id);
  const template = plannedTemplateForDate(date, settings.cycle_start_date, templates);
  if (!template) throw new Error("Nenhum treino programado.");
  const log = await getOrCreateDailyLog(supabase, user.id, date, settings);
  const session = await startWorkout(supabase, user.id, date, template, log.id);
  refresh();
  return session;
}

export async function markWorkoutStatusAction(sessionId: string, status: WorkoutSessionStatus, date: string) {
  if (useDemo()) {
    demoMarkWorkout(sessionId, status);
    refresh();
    return;
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  await getOrCreateDailyLog(supabase, user.id, date, settings);
  await markWorkoutStatus(supabase, sessionId, status);
  refresh();
}

export async function saveSetAction(
  setId: string,
  patch: { weight?: number | null; reps?: number | null; rir?: number | null },
) {
  if (useDemo()) {
    demoUpdateSet(setId, patch);
    return;
  }
  const { supabase } = await requireUser();
  await updateExerciseSet(supabase, setId, patch);
}

export async function completeExerciseAction(exerciseSessionId: string) {
  if (useDemo()) {
    demoCompleteExercise(exerciseSessionId);
    refresh();
    return;
  }
  const { supabase } = await requireUser();
  await completeExerciseSession(supabase, exerciseSessionId);
  refresh();
}

export async function finishWorkoutAction(sessionId: string, durationSeconds: number) {
  if (useDemo()) {
    demoFinishWorkout(sessionId, durationSeconds);
    refresh();
    return;
  }
  const { supabase } = await requireUser();
  await finishWorkout(supabase, sessionId, durationSeconds);
  refresh();
}

export async function saveSettingsAction(values: unknown) {
  const parsed = settingsSchema.parse(values);
  if (useDemo()) {
    const { name, ...settings } = parsed;
    demoUpdateSettings(name, settings);
    refresh();
    return;
  }
  const { supabase, user } = await requireUser();
  const { name, ...settings } = parsed;
  await updateProfileName(supabase, user.id, name);
  await updateSettings(supabase, user.id, settings);
  refresh();
}

export async function saveTemplateExerciseAction(
  id: string,
  patch: { work_sets?: number; rep_min?: number; rep_max?: number; rest_seconds?: number },
) {
  if (useDemo()) {
    demoUpdateTemplateExercise(id, patch);
    refresh();
    return;
  }
  const { supabase } = await requireUser();
  await updateTemplateExercise(supabase, id, patch);
  refresh();
}

export async function uploadPhotoAction(formData: FormData) {
  if (useDemo()) {
    refresh();
    return null;
  }
  const { supabase, user } = await requireUser();
  const file = formData.get("file");
  const date = String(formData.get("date") ?? "");
  const category = String(formData.get("category") ?? "other");
  const weightRaw = formData.get("weight");
  if (!(file instanceof File) || !date) {
    throw new Error("Arquivo e data são obrigatórios.");
  }
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${date}-${category}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("progress-photos").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const weight = weightRaw ? Number(weightRaw) : null;
  const photo = await addPhoto(supabase, user.id, {
    date,
    category: category as never,
    storage_path: path,
    weight: Number.isFinite(weight) ? weight : null,
  });
  refresh();
  return photo;
}

export async function signOutAction() {
  if (isAuthDisabled() || useDemo()) {
    redirect("/dashboard");
  }
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function ensureTodayLogAction(date: string) {
  if (useDemo()) {
    const today = demoUpdateDailyLog(date, {});
    return { log: today, meals: demoReplaceMeals(date, ["07:00", "12:00", "17:30", "21:30"]) };
  }
  const { supabase, user } = await requireUser();
  const settings = await getSettings(supabase, user.id);
  const log = await getOrCreateDailyLog(supabase, user.id, date, settings);
  const meals = await listMealTimes(supabase, log.id);
  return { log, meals };
}
