import type { SupabaseClient } from "@supabase/supabase-js";
import { computeWeekSnapshot } from "@/services/analytics.service";
import {
  getOrCreateDailyLog,
  getOrCreateWeek,
  getWeekByNumber,
  listCardioByLog,
  listDailyLogsByWeek,
  listMealTimes,
  listTemplates,
} from "@/services/daily-log.service";
import { latestWeight, listHealthNotes, listPhotos, listWeightLogs, signedPhotoUrls } from "@/services/entries.service";
import { getProfileAndSettings } from "@/services/settings.service";
import {
  getWorkoutSessionForDate,
  listExercises,
  listTemplateExercises,
  listWorkoutSessionsInRange,
} from "@/services/workout.service";
import { plannedTemplateForDate } from "@/domain/week";
import { datesInRange, todayDateString } from "@/utils/dates";
import { isDemoMode } from "@/lib/runtime";
import {
  demoLoadAppContext,
  demoLoadDashboard,
  demoLoadNotesAndPhotos,
  demoLoadToday,
  demoLoadTraining,
  demoLoadWeekView,
} from "@/services/demo-state";

export async function loadAppContext(supabase: SupabaseClient, userId: string, date = todayDateString()) {
  if (!isDemoMode()) return demoLoadAppContext(date);
  const { profile, settings } = await getProfileAndSettings(supabase, userId);
  const week = await getOrCreateWeek(supabase, userId, date, settings.program_start_date);
  const log = await getOrCreateDailyLog(supabase, userId, date, settings);
  const templates = await listTemplates(supabase, userId);
  return { profile, settings, week, log, templates };
}

export async function loadToday(supabase: SupabaseClient, userId: string, date: string) {
  if (!isDemoMode()) return demoLoadToday(date);
  const context = await loadAppContext(supabase, userId, date);
  const [meals, cardio, session, weight] = await Promise.all([
    listMealTimes(supabase, context.log.id),
    listCardioByLog(supabase, context.log.id),
    getWorkoutSessionForDate(supabase, userId, date),
    latestWeight(supabase, userId),
  ]);
  const planned = plannedTemplateForDate(date, context.settings.cycle_start_date, context.templates);
  return { ...context, meals, cardio, session, weight, planned };
}

export async function loadWeekView(supabase: SupabaseClient, userId: string, weekNumber?: number) {
  if (!isDemoMode()) return demoLoadWeekView(weekNumber);
  const { profile, settings } = await getProfileAndSettings(supabase, userId);
  const today = todayDateString();
  const currentWeek = await getOrCreateWeek(supabase, userId, today, settings.program_start_date);
  const week = weekNumber
    ? ((await getWeekByNumber(supabase, userId, weekNumber)) ?? currentWeek)
    : currentWeek;
  for (const date of datesInRange(week.start_date, week.end_date)) {
    await getOrCreateDailyLog(supabase, userId, date, settings);
  }
  const previous = await getWeekByNumber(supabase, userId, week.week_number - 1);
  const [snapshot, prevSnapshot, templates] = await Promise.all([
    computeWeekSnapshot(supabase, userId, week, settings),
    previous ? computeWeekSnapshot(supabase, userId, previous, settings) : Promise.resolve(null),
    listTemplates(supabase, userId),
  ]);

  const dates = datesInRange(week.start_date, week.end_date);
  const mealMap: Record<string, string[]> = {};
  await Promise.all(
    snapshot.logs.map(async (log) => {
      const meals = await listMealTimes(supabase, log.id);
      mealMap[log.date] = meals.map((meal) => meal.time.slice(0, 5));
    }),
  );

  return {
    profile,
    settings,
    week,
    previous,
    snapshot,
    prevSnapshot,
    templates,
    dates,
    mealMap,
    currentWeekNumber: currentWeek.week_number,
  };
}

export async function loadDashboard(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) return demoLoadDashboard();
  const weekView = await loadWeekView(supabase, userId);
  const weights = await listWeightLogs(supabase, userId, { limit: 90 });
  return { ...weekView, weights, latestWeight: weights[0] ?? null };
}

export async function loadTrainingModule(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) return demoLoadTraining();
  const context = await loadAppContext(supabase, userId);
  const sessions = await listWorkoutSessionsInRange(
    supabase,
    userId,
    context.week.start_date,
    context.week.end_date,
  );
  const catalog = [];
  for (const template of context.templates) {
    catalog.push({
      template,
      exercises: template.is_rest ? [] : await listTemplateExercises(supabase, template.id),
    });
  }
  const exercises = await listExercises(supabase, userId);
  return { ...context, sessions, catalog, exercises };
}

export async function loadNotesAndPhotos(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) return demoLoadNotesAndPhotos();
  const [notes, photos] = await Promise.all([listHealthNotes(supabase, userId), listPhotos(supabase, userId)]);
  return { notes, photos: await signedPhotoUrls(supabase, photos) };
}

export async function loadNutritionPage(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return { ...demoLoadWeekView(), today: demoLoadToday(todayDateString()) };
  }
  const weekView = await loadWeekView(supabase, userId);
  const today = await loadToday(supabase, userId, todayDateString());
  return { ...weekView, today };
}

export { listDailyLogsByWeek };
