import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_MEAL_TIMES } from "@/domain/constants";
import { calculateSleepMinutes } from "@/domain/sleep";
import { buildWeekBounds, dayTypeForTemplate, plannedTemplateForDate } from "@/domain/week";
import { timeToMinutes } from "@/utils/dates";
import { isDemoMode } from "@/lib/runtime";
import { mockStore } from "@/lib/mock-store";
import type {
  CardioSession,
  DailyLog,
  DailyLogPatch,
  FitnessSettings,
  MealTime,
  Week,
  WorkoutTemplate,
} from "@/types";

export async function getOrCreateWeek(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  programStart: string,
) {
  if (!isDemoMode()) {
    return mockStore.getOrCreateWeek(date, programStart);
  }
  try {
    const bounds = buildWeekBounds(date, programStart);
    const existing = await supabase
      .from("weeks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_number", bounds.weekNumber)
      .maybeSingle();
    if (existing.error) return mockStore.getOrCreateWeek(date, programStart);
    if (existing.data) return existing.data as Week;

    const created = await supabase
      .from("weeks")
      .insert({
        user_id: userId,
        week_number: bounds.weekNumber,
        start_date: bounds.startDate,
        end_date: bounds.endDate,
        status: "open",
      })
      .select("*")
      .single();
    if (created.error) {
      const again = await supabase
        .from("weeks")
        .select("*")
        .eq("user_id", userId)
        .eq("week_number", bounds.weekNumber)
        .single();
      if (again.error) return mockStore.getOrCreateWeek(date, programStart);
      return again.data as Week;
    }
    return created.data as Week;
  } catch {
    return mockStore.getOrCreateWeek(date, programStart);
  }
}

export async function getWeekByNumber(supabase: SupabaseClient, userId: string, weekNumber: number) {
  if (!isDemoMode()) {
    return mockStore.getWeekByNumber(weekNumber);
  }
  try {
    const { data, error } = await supabase
      .from("weeks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_number", weekNumber)
      .maybeSingle();
    if (error) return mockStore.getWeekByNumber(weekNumber);
    return (data as Week | null) ?? null;
  } catch {
    return mockStore.getWeekByNumber(weekNumber);
  }
}

export async function listTemplates(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return mockStore.listTemplates();
  }
  try {
    const { data, error } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("user_id", userId)
      .order("order_index");
    if (error || !data || data.length === 0) return mockStore.listTemplates();
    return (data ?? []) as WorkoutTemplate[];
  } catch {
    return mockStore.listTemplates();
  }
}

export async function getOrCreateDailyLog(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  settings: FitnessSettings,
) {
  if (!isDemoMode()) {
    return mockStore.getOrCreateDailyLog(date);
  }
  try {
    const existing = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();
    if (existing.error) return mockStore.getOrCreateDailyLog(date);
    if (existing.data) {
      return existing.data as DailyLog;
    }

    const week = await getOrCreateWeek(supabase, userId, date, settings.program_start_date);
    const templates = await listTemplates(supabase, userId);
    const template = plannedTemplateForDate(date, settings.cycle_start_date, templates);

    const created = await supabase
      .from("daily_logs")
      .insert({
        week_id: week.id,
        user_id: userId,
        date,
        day_type: dayTypeForTemplate(template),
      })
      .select("*")
      .single();
    if (created.error) {
      const again = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .single();
      if (again.error) return mockStore.getOrCreateDailyLog(date);
      return again.data as DailyLog;
    }

    await supabase.from("meal_times").insert(
      DEFAULT_MEAL_TIMES.map((time, position) => ({
        daily_log_id: created.data.id,
        time,
        position,
      })),
    );

    return created.data as DailyLog;
  } catch {
    return mockStore.getOrCreateDailyLog(date);
  }
}

export async function getDailyLog(supabase: SupabaseClient, userId: string, date: string) {
  if (!isDemoMode()) {
    return mockStore.getOrCreateDailyLog(date);
  }
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();
    if (error) return mockStore.getOrCreateDailyLog(date);
    return (data as DailyLog | null) ?? null;
  } catch {
    return mockStore.getOrCreateDailyLog(date);
  }
}

export async function listDailyLogsByWeek(supabase: SupabaseClient, weekId: string) {
  if (!isDemoMode()) {
    return mockStore.listDailyLogsByWeek(weekId);
  }
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("week_id", weekId)
      .order("date");
    if (error || !data || data.length === 0) return mockStore.listDailyLogsByWeek(weekId);
    return (data ?? []) as DailyLog[];
  } catch {
    return mockStore.listDailyLogsByWeek(weekId);
  }
}

export async function listMealTimes(supabase: SupabaseClient, dailyLogId: string) {
  if (!isDemoMode()) {
    return mockStore.listMealTimes(dailyLogId);
  }
  try {
    const { data, error } = await supabase
      .from("meal_times")
      .select("*")
      .eq("daily_log_id", dailyLogId)
      .order("position");
    if (error || !data || data.length === 0) return mockStore.listMealTimes(dailyLogId);
    return (data ?? []) as MealTime[];
  } catch {
    return mockStore.listMealTimes(dailyLogId);
  }
}

export async function replaceMealTimes(
  supabase: SupabaseClient,
  dailyLogId: string,
  times: string[],
) {
  if (!isDemoMode()) {
    return mockStore.replaceMealTimes(dailyLogId, times);
  }
  try {
    const { error: delError } = await supabase.from("meal_times").delete().eq("daily_log_id", dailyLogId);
    if (delError) return mockStore.replaceMealTimes(dailyLogId, times);
    if (times.length === 0) return [];
    const { data, error } = await supabase
      .from("meal_times")
      .insert(times.map((time, position) => ({ daily_log_id: dailyLogId, time, position })))
      .select("*");
    if (error) return mockStore.replaceMealTimes(dailyLogId, times);
    return (data ?? []) as MealTime[];
  } catch {
    return mockStore.replaceMealTimes(dailyLogId, times);
  }
}

export function deriveMealCutoff(times: string[], cutoff: string) {
  if (times.length === 0) return { lastMeal: null as string | null, hit: null as boolean | null };
  const lastMeal = [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)).at(-1) ?? null;
  if (!lastMeal) return { lastMeal: null, hit: null };
  return { lastMeal, hit: timeToMinutes(lastMeal) <= timeToMinutes(cutoff) };
}

export async function updateDailyLog(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  settings: FitnessSettings,
  patch: DailyLogPatch,
) {
  if (!isDemoMode()) {
    return mockStore.updateDailyLog(date, patch);
  }
  try {
    const log = await getOrCreateDailyLog(supabase, userId, date, settings);
    const next = { ...patch };
    if (patch.sleep_start !== undefined || patch.sleep_end !== undefined) {
      const start = patch.sleep_start !== undefined ? patch.sleep_start : log.sleep_start;
      const end = patch.sleep_end !== undefined ? patch.sleep_end : log.sleep_end;
      next.sleep_start = start;
      next.sleep_end = end;
      (next as DailyLogPatch & { sleep_minutes?: number | null }).sleep_minutes =
        calculateSleepMinutes(start, end);
    }
    const { data, error } = await supabase
      .from("daily_logs")
      .update(next)
      .eq("id", log.id)
      .select("*")
      .single();
    if (error) return mockStore.updateDailyLog(date, patch);
    return data as DailyLog;
  } catch {
    return mockStore.updateDailyLog(date, patch);
  }
}

export async function listCardioByLog(supabase: SupabaseClient, dailyLogId: string) {
  if (!isDemoMode()) {
    return mockStore.listCardioByLog(dailyLogId);
  }
  try {
    const { data, error } = await supabase
      .from("cardio_sessions")
      .select("*")
      .eq("daily_log_id", dailyLogId)
      .order("created_at");
    if (error) return mockStore.listCardioByLog(dailyLogId);
    return (data ?? []) as CardioSession[];
  } catch {
    return mockStore.listCardioByLog(dailyLogId);
  }
}

export async function listCardioByWeek(supabase: SupabaseClient, userId: string, dates: string[]) {
  if (!isDemoMode()) {
    return mockStore.listCardioByWeek(dates);
  }
  try {
    if (dates.length === 0) return [] as Array<CardioSession & { daily_logs?: { date: string } }>;
    const logs = await supabase
      .from("daily_logs")
      .select("id, date")
      .eq("user_id", userId)
      .gte("date", dates[0])
      .lte("date", dates[dates.length - 1]);
    if (logs.error) return mockStore.listCardioByWeek(dates);
    const ids = (logs.data ?? []).map((log) => log.id);
    if (ids.length === 0) return [];
    const dateById = new Map((logs.data ?? []).map((log) => [log.id, log.date]));
    const { data, error } = await supabase.from("cardio_sessions").select("*").in("daily_log_id", ids);
    if (error) return mockStore.listCardioByWeek(dates);
    return (data ?? []).map((item) => ({
      ...(item as CardioSession),
      daily_logs: { date: dateById.get(item.daily_log_id) ?? "" },
    }));
  } catch {
    return mockStore.listCardioByWeek(dates);
  }
}

export async function addCardioSession(
  supabase: SupabaseClient,
  userId: string,
  dailyLogId: string,
  payload: Pick<CardioSession, "type" | "minutes" | "rpe" | "timing" | "notes">,
) {
  if (!isDemoMode()) {
    return mockStore.addCardioSession(dailyLogId, payload);
  }
  try {
    const { data, error } = await supabase
      .from("cardio_sessions")
      .insert({
        daily_log_id: dailyLogId,
        user_id: userId,
        ...payload,
      })
      .select("*")
      .single();
    if (error) return mockStore.addCardioSession(dailyLogId, payload);
    return data as CardioSession;
  } catch {
    return mockStore.addCardioSession(dailyLogId, payload);
  }
}

export async function deleteCardioSession(supabase: SupabaseClient, id: string) {
  if (!isDemoMode()) {
    mockStore.deleteCardioSession(id);
    return;
  }
  const { error } = await supabase.from("cardio_sessions").delete().eq("id", id);
  if (error) throw error;
}