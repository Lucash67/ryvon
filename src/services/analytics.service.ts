import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calorieAdherence,
  cardioAdherence,
  generalAdherence,
  isCalorieInRange,
  isProteinInRange,
  mealTimeAdherence,
  nutritionBlend,
  proteinAdherence,
  sleepAdherence,
  targetsForDay,
  trainingAdherence,
} from "@/domain/adherence";
import { buildInsights, reportConclusions, reportPriorities, reportReading } from "@/domain/insights";
import { blockStatus, scoreFromAdherence, verdictFromScore } from "@/domain/scores";
import { ACTIVITY_LABELS } from "@/domain/constants";
import { average, mostCommon, sum } from "@/utils/format";
import { datesInRange } from "@/utils/dates";
import { listCardioByWeek, listDailyLogsByWeek } from "@/services/daily-log.service";
import { latestWeight, listWeightLogs } from "@/services/entries.service";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mock-store";
import { listWorkoutSessionsInRange } from "@/services/workout.service";
import type {
  CardioSession,
  DailyLog,
  FitnessSettings,
  MacroTargets,
  Week,
  WeeklyReport,
  WeeklyReportSummary,
  WorkoutSession,
} from "@/types";

function onTargets(settings: FitnessSettings): MacroTargets {
  return {
    calories: settings.on_calories,
    protein: settings.on_protein,
    carbs: settings.on_carbs,
    fat: settings.on_fat,
  };
}

function offTargets(settings: FitnessSettings): MacroTargets {
  return {
    calories: settings.off_calories,
    protein: settings.off_protein,
    carbs: settings.off_carbs,
    fat: settings.off_fat,
  };
}

function mixedCalorieTarget(logs: DailyLog[], settings: FitnessSettings) {
  const values = logs.map((log) => targetsForDay(log.day_type, onTargets(settings), offTargets(settings)).calories);
  return average(values) ?? settings.on_calories;
}

function mixedProteinTarget(logs: DailyLog[], settings: FitnessSettings) {
  const values = logs.map((log) => targetsForDay(log.day_type, onTargets(settings), offTargets(settings)).protein);
  return average(values) ?? settings.on_protein;
}

export async function computeWeekSnapshot(
  supabase: SupabaseClient,
  userId: string,
  week: Week,
  settings: FitnessSettings,
) {
  const dates = datesInRange(week.start_date, week.end_date);
  const [logs, cardio, workouts, weights] = await Promise.all([
    listDailyLogsByWeek(supabase, week.id),
    listCardioByWeek(supabase, userId, dates),
    listWorkoutSessionsInRange(supabase, userId, week.start_date, week.end_date),
    listWeightLogs(supabase, userId, { start: week.start_date, end: week.end_date }),
  ]);

  return buildWeekSnapshot({ logs, cardio, workouts, weights, settings, week });
}

export function buildWeekSnapshot(input: {
  logs: DailyLog[];
  cardio: Array<CardioSession & { daily_logs?: { date: string } }>;
  workouts: WorkoutSession[];
  weights: Array<{ date: string; weight: number }>;
  settings: FitnessSettings;
  week: Week;
}) {
  const { logs, cardio, workouts, weights, settings } = input;
  const nutritionLogs = logs.filter((log) => log.calories != null);
  const sleepLogs = logs.filter((log) => log.sleep_minutes != null);
  const restCompleted = workouts.filter(
    (session) => session.status === "completed" && (session.template?.is_rest || session.label === "Descanso"),
  ).length;
  const trainingCompleted = workouts.filter((session) => {
    const rest = session.template?.is_rest || session.label === "Descanso";
    return session.status === "completed" && !rest;
  }).length;
  const trainingPlanned = 5;
  const missed = workouts.filter((session) => session.status === "missed").length;
  const cardioTotal = sum(cardio.map((item) => item.minutes));
  const calorieAvg = average(nutritionLogs.map((log) => log.calories));
  const proteinAvg = average(nutritionLogs.map((log) => log.protein));
  const carbsAvg = average(nutritionLogs.map((log) => log.carbs));
  const fatAvg = average(nutritionLogs.map((log) => log.fat));
  const sleepAvg = average(sleepLogs.map((log) => log.sleep_minutes));
  const calorieTarget = mixedCalorieTarget(logs.length ? logs : nutritionLogs, settings);
  const proteinTarget = mixedProteinTarget(logs.length ? logs : nutritionLogs, settings);
  const mealLogged = logs.filter((log) => log.meal_cutoff_hit != null);
  const mealHits = mealLogged.filter((log) => log.meal_cutoff_hit).length;

  const training = trainingAdherence(trainingCompleted, trainingPlanned);
  const cardioA = cardioAdherence(cardioTotal, settings.weekly_cardio_goal);
  const calorieA = calorieAdherence(calorieAvg, calorieTarget);
  const proteinA = proteinAdherence(proteinAvg, proteinTarget);
  const nutrition = nutritionBlend(calorieA, proteinA);
  const sleepA = sleepAdherence(sleepAvg, settings.sleep_goal_minutes);
  const routine = mealTimeAdherence(mealHits, mealLogged.length);
  const general = generalAdherence(
    { training, nutrition, sleep: sleepA, cardio: cardioA, routine },
    settings.adherence_weights,
  );

  const calorieDays = nutritionLogs.filter((log) =>
    isCalorieInRange(log.calories, targetsForDay(log.day_type, onTargets(settings), offTargets(settings)).calories),
  ).length;
  const proteinDays = nutritionLogs.filter((log) =>
    isProteinInRange(log.protein, targetsForDay(log.day_type, onTargets(settings), offTargets(settings)).protein),
  ).length;

  const summary: WeeklyReportSummary = {
    calories_total: nutritionLogs.length ? sum(nutritionLogs.map((log) => log.calories)) : null,
    calories_avg: calorieAvg,
    protein_avg: proteinAvg,
    carbs_avg: carbsAvg,
    fat_avg: fatAvg,
    sleep_avg_minutes: sleepAvg,
    cardio_total: cardioTotal,
    cardio_avg: nutritionLogs.length || cardio.length ? cardioTotal / 7 : null,
    workouts_planned: trainingPlanned,
    workouts_completed: trainingCompleted,
    workouts_missed: missed,
    training_adherence: training ?? 0,
    calorie_days_in_range: calorieDays,
    protein_days_in_range: proteinDays,
    meal_cutoff_days: mealHits,
    days_logged: logs.length,
    activity_avg: mostCommon(logs.map((log) => log.activity_level).filter(Boolean) as Array<"low" | "medium" | "high">)
      ? ACTIVITY_LABELS[
          mostCommon(logs.map((log) => log.activity_level).filter(Boolean) as Array<"low" | "medium" | "high">)!
        ]
      : null,
    weekly_weight: weights.at(-1)?.weight ?? weights[0]?.weight ?? null,
    reading: "",
    conclusions: [],
    priorities: [],
  };

  const scores = {
    training: scoreFromAdherence(training),
    nutrition: scoreFromAdherence(nutrition),
    cardio: scoreFromAdherence(cardioA),
    sleep: scoreFromAdherence(sleepA),
    routine: scoreFromAdherence(routine),
    general: scoreFromAdherence(general),
  };

  summary.reading = reportReading({
    generalScore: scores.general,
    trainingAdherence: training,
    sleepAvg,
    sleepGoal: settings.sleep_goal_minutes,
    cardioMinutes: cardioTotal,
    cardioGoal: settings.weekly_cardio_goal,
    proteinAvg,
    proteinTarget,
  });
  summary.conclusions = reportConclusions({
    workoutsMissed: missed,
    sleepMin: sleepLogs.length ? Math.min(...sleepLogs.map((log) => log.sleep_minutes ?? 0)) : null,
    mealCutoffRate: routine,
    proteinAvg,
    proteinTarget,
  });
  summary.priorities = reportPriorities({
    sleepAdherence: sleepA,
    cardioAdherence: cardioA,
    proteinAdherence: proteinA,
    trainingAdherence: training,
  });

  return {
    logs,
    cardio,
    workouts,
    weights,
    summary,
    scores,
    verdict: verdictFromScore(scores.general),
    adherence: { training, nutrition, sleep: sleepA, cardio: cardioA, routine, general },
    targets: { calorieTarget, proteinTarget },
    status: {
      training: blockStatus(training),
      cardio: blockStatus(cardioA),
      sleep: blockStatus(sleepA),
      nutrition: blockStatus(nutrition),
    },
    extras: {
      restCompleted,
      cardioRpeAvg: average(cardio.map((item) => item.rpe)),
      cardioMode: mostCommon(cardio.map((item) => item.type)),
    },
  };
}

export async function upsertWeeklyReport(
  supabase: SupabaseClient,
  weekId: string,
  snapshot: ReturnType<typeof buildWeekSnapshot>,
) {
  const payload = {
    week_id: weekId,
    generated_at: new Date().toISOString(),
    training_score: snapshot.scores.training,
    nutrition_score: snapshot.scores.nutrition,
    cardio_score: snapshot.scores.cardio,
    sleep_score: snapshot.scores.sleep,
    routine_score: snapshot.scores.routine,
    general_score: snapshot.scores.general,
    verdict: snapshot.verdict,
    summary: snapshot.summary,
  };
  if (!isSupabaseConfigured()) {
    return mockStore.upsertWeeklyReport(payload as any);
  }
  try {
    const { data, error } = await supabase
      .from("weekly_reports")
      .upsert(payload, { onConflict: "week_id" })
      .select("*")
      .single();
    if (error) return mockStore.upsertWeeklyReport(payload as any);
    return data as WeeklyReport;
  } catch {
    return mockStore.upsertWeeklyReport(payload as any);
  }
}

export async function getWeeklyReport(supabase: SupabaseClient, weekId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("week_id", weekId)
      .maybeSingle();
    if (error) return null;
    return (data as WeeklyReport | null) ?? null;
  } catch {
    return null;
  }
}

export async function dashboardInsights(
  current: ReturnType<typeof buildWeekSnapshot>,
  previous: ReturnType<typeof buildWeekSnapshot> | null,
  settings: FitnessSettings,
) {
  return buildInsights({
    sleepAvg: current.summary.sleep_avg_minutes,
    prevSleepAvg: previous?.summary.sleep_avg_minutes ?? null,
    cardioMinutes: current.summary.cardio_total,
    cardioGoal: settings.weekly_cardio_goal,
    proteinAvg: current.summary.protein_avg,
    proteinTarget: current.targets.proteinTarget,
    workoutsCompleted: current.summary.workouts_completed,
    workoutsPlanned: current.summary.workouts_planned,
    calorieAvg: current.summary.calories_avg,
    calorieTarget: current.targets.calorieTarget,
  });
}

export { latestWeight };
