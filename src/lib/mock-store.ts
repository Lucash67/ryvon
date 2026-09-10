import {
  DEFAULT_ADHERENCE_WEIGHTS,
  DEFAULT_MEAL_PLAN,
  DEFAULT_MEAL_TIMES,
  PROGRAM_START_DATE,
  CYCLE_START_DATE,
} from "@/domain/constants";
import { SEED_EXERCISES, SEED_TEMPLATES, WEEK1_LOGS } from "@/domain/program";
import { buildWeekBounds, plannedTemplateForDate, dayTypeForTemplate } from "@/domain/week";
import { datesInRange } from "@/utils/dates";
import { calculateSleepMinutes } from "@/domain/sleep";
import type {
  CardioSession,
  DailyLog,
  DailyLogPatch,
  Exercise,
  ExerciseSession,
  ExerciseSet,
  FitnessSettings,
  HealthNote,
  MealPlan,
  MealTime,
  Profile,
  ProgressPhoto,
  Week,
  WeeklyReport,
  WeightLog,
  WorkoutSession,
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from "@/types";

export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

class MockStore {
  profile: Profile = {
    id: MOCK_USER_ID,
    name: "Lucas",
    created_at: "2026-08-30T00:00:00Z",
  };

  settings: FitnessSettings = {
    user_id: MOCK_USER_ID,
    weekly_cardio_goal: 200,
    cardio_rpe_goal: 8,
    sleep_goal_minutes: 450,
    meal_cutoff_time: "21:30:00",
    on_calories: 2270,
    on_protein: 146,
    on_carbs: 322,
    on_fat: 44,
    off_calories: 2060,
    off_protein: 142,
    off_carbs: 279,
    off_fat: 43,
    cycle_start_date: CYCLE_START_DATE,
    program_start_date: PROGRAM_START_DATE,
    meal_plan: DEFAULT_MEAL_PLAN,
    adherence_weights: DEFAULT_ADHERENCE_WEIGHTS,
    updated_at: new Date().toISOString(),
  };

  weeks: Week[] = [
    {
      id: "week-1",
      user_id: MOCK_USER_ID,
      week_number: 1,
      start_date: "2026-08-30",
      end_date: "2026-09-05",
      notes: "Semana 1 de adaptacao",
      status: "closed",
    },
    {
      id: "week-2",
      user_id: MOCK_USER_ID,
      week_number: 2,
      start_date: "2026-09-06",
      end_date: "2026-09-12",
      notes: null,
      status: "open",
    },
  ];

  exercises: Exercise[] = SEED_EXERCISES.map((item, idx) => ({
    id: `ex-${idx + 1}`,
    user_id: MOCK_USER_ID,
    name: item.name,
    muscle_group: item.muscle,
  }));

  templates: WorkoutTemplate[] = SEED_TEMPLATES.map((item, idx) => ({
    id: `tmpl-${idx + 1}`,
    user_id: MOCK_USER_ID,
    name: item.name,
    slug: item.slug,
    order_index: idx,
    is_rest: item.isRest,
  }));

  templateExercises: WorkoutTemplateExercise[] = [];
  dailyLogs: DailyLog[] = [];
  mealTimes: MealTime[] = [];
  cardioSessions: CardioSession[] = [];
  workoutSessions: WorkoutSession[] = [];
  exerciseSessions: ExerciseSession[] = [];
  exerciseSets: ExerciseSet[] = [];
  weightLogs: WeightLog[] = [
    { id: "w-4", user_id: MOCK_USER_ID, date: "2026-09-07", weight: 69.0, fasted: true, notes: null },
    { id: "w-3", user_id: MOCK_USER_ID, date: "2026-09-05", weight: 69.1, fasted: true, notes: null },
    { id: "w-2", user_id: MOCK_USER_ID, date: "2026-09-02", weight: 69.4, fasted: true, notes: null },
    { id: "w-1", user_id: MOCK_USER_ID, date: "2026-08-30", weight: 69.6, fasted: true, notes: "Inicio do acompanhamento" },
  ];
  healthNotes: HealthNote[] = [
    {
      id: "hn-1",
      user_id: MOCK_USER_ID,
      date: "2026-09-04",
      type: "discomfort",
      status: "improving",
      note: "Incômodo entre bíceps e antebraço.",
    },
  ];
  photos: ProgressPhoto[] = [];
  weeklyReports: WeeklyReport[] = [];

  constructor() {
    this.initTemplateExercises();
    this.initSeedLogs();
  }

  private initTemplateExercises() {
    let positionCounter = 1;
    for (const [tIdx, template] of SEED_TEMPLATES.entries()) {
      const templateId = `tmpl-${tIdx + 1}`;
      for (const ex of template.exercises) {
        const foundEx = this.exercises.find((e) => e.name === ex.name);
        if (!foundEx) continue;
        this.templateExercises.push({
          id: `te-${positionCounter}`,
          template_id: templateId,
          exercise_id: foundEx.id,
          position: positionCounter++,
          work_sets: ex.workSets,
          rep_min: ex.repMin,
          rep_max: ex.repMax,
          rest_seconds: ex.rest,
          instructions: ex.instructions ?? null,
          exercise: foundEx,
        });
      }
    }
  }

  private initSeedLogs() {
    for (const item of WEEK1_LOGS) {
      const logId = `log-${item.date}`;
      const log: DailyLog = {
        id: logId,
        week_id: "week-1",
        user_id: MOCK_USER_ID,
        date: item.date,
        day_type: (item.dayType as "on" | "off") ?? "on",
        sleep_start: item.sleepStart ?? "23:00",
        sleep_end: item.sleepEnd ?? "07:00",
        sleep_minutes: item.sleepMinutes ?? 480,
        sleep_quality: 4,
        activity_level: (item.activity as "low" | "medium" | "high") ?? "low",
        calories: item.calories ?? 2200,
        protein: item.protein ?? 140,
        carbs: item.carbs ?? 260,
        fat: item.fat ?? 45,
        last_meal_at: "21:15",
        meal_cutoff_hit: true,
        notes: null,
        created_at: `${item.date}T07:00:00Z`,
        updated_at: `${item.date}T22:00:00Z`,
      };
      this.dailyLogs.push(log);

      DEFAULT_MEAL_TIMES.forEach((time, pos) => {
        this.mealTimes.push({
          id: `meal-${logId}-${pos}`,
          daily_log_id: logId,
          time,
          position: pos,
        });
      });

      if (item.cardio) {
        for (const [cIdx, c] of item.cardio.entries()) {
          this.cardioSessions.push({
            id: `cardio-${logId}-${cIdx}`,
            daily_log_id: logId,
            user_id: MOCK_USER_ID,
            type: c.type as any,
            minutes: c.minutes,
            rpe: 8,
            timing: "after_workout",
            notes: null,
            created_at: `${item.date}T19:00:00Z`,
          });
        }
      }

      if (item.workout) {
        const isRest = item.workout.label.toLowerCase().includes("descanso");
        this.workoutSessions.push({
          id: `ws-${item.date}`,
          user_id: MOCK_USER_ID,
          template_id: isRest ? null : "tmpl-1",
          daily_log_id: logId,
          date: item.date,
          status: item.workout.status as any,
          started_at: `${item.date}T18:00:00Z`,
          completed_at: `${item.date}T19:15:00Z`,
          duration_seconds: 4500,
          label: item.workout.label,
          notes: null,
          created_at: `${item.date}T18:00:00Z`,
        });
      }
    }

    const week2Dates = datesInRange("2026-09-06", "2026-09-12");
    for (const date of week2Dates) {
      this.getOrCreateDailyLog(date);
    }
  }

  getProfile(): Profile {
    return this.profile;
  }

  getSettings(): FitnessSettings {
    return this.settings;
  }

  updateProfileName(name: string) {
    this.profile.name = name;
  }

  updateSettings(patch: Partial<FitnessSettings>): FitnessSettings {
    this.settings = { ...this.settings, ...patch, updated_at: new Date().toISOString() };
    return this.settings;
  }

  updateMealPlan(mealPlan: MealPlan) {
    this.settings.meal_plan = mealPlan;
    this.settings.updated_at = new Date().toISOString();
  }

  getOrCreateWeek(date: string, programStart: string): Week {
    const bounds = buildWeekBounds(date, programStart);
    let existing = this.weeks.find((w) => w.week_number === bounds.weekNumber);
    if (!existing) {
      existing = {
        id: `week-${bounds.weekNumber}`,
        user_id: MOCK_USER_ID,
        week_number: bounds.weekNumber,
        start_date: bounds.startDate,
        end_date: bounds.endDate,
        notes: null,
        status: "open",
      };
      this.weeks.push(existing);
    }
    return existing;
  }

  getWeekByNumber(weekNumber: number): Week | null {
    return this.weeks.find((w) => w.week_number === weekNumber) ?? null;
  }

  listTemplates(): WorkoutTemplate[] {
    return [...this.templates].sort((a, b) => a.order_index - b.order_index);
  }

  getOrCreateDailyLog(date: string): DailyLog {
    let existing = this.dailyLogs.find((l) => l.date === date);
    if (!existing) {
      const week = this.getOrCreateWeek(date, this.settings.program_start_date);
      const planned = plannedTemplateForDate(date, this.settings.cycle_start_date, this.templates);
      const dayType = dayTypeForTemplate(planned);

      const isPastOrToday = date <= "2026-09-07";
      const logId = `log-${date}`;
      existing = {
        id: logId,
        week_id: week.id,
        user_id: MOCK_USER_ID,
        date,
        day_type: dayType,
        sleep_start: isPastOrToday ? "23:15" : null,
        sleep_end: isPastOrToday ? "06:45" : null,
        sleep_minutes: isPastOrToday ? 450 : null,
        sleep_quality: isPastOrToday ? 4 : null,
        activity_level: isPastOrToday ? "medium" : null,
        calories: isPastOrToday ? (dayType === "on" ? 2250 : 2040) : null,
        protein: isPastOrToday ? (dayType === "on" ? 146 : 140) : null,
        carbs: isPastOrToday ? (dayType === "on" ? 315 : 270) : null,
        fat: isPastOrToday ? (dayType === "on" ? 44 : 42) : null,
        last_meal_at: isPastOrToday ? "21:10" : null,
        meal_cutoff_hit: isPastOrToday ? true : null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.dailyLogs.push(existing);

      if (isPastOrToday) {
        DEFAULT_MEAL_TIMES.forEach((time, pos) => {
          this.mealTimes.push({
            id: `meal-${logId}-${pos}`,
            daily_log_id: logId,
            time,
            position: pos,
          });
        });

        this.cardioSessions.push({
          id: `cardio-${logId}-1`,
          daily_log_id: logId,
          user_id: MOCK_USER_ID,
          type: "bike",
          minutes: 30,
          rpe: 8,
          timing: "after_workout",
          notes: null,
          created_at: new Date().toISOString(),
        });

        if (planned && !planned.is_rest) {
          this.workoutSessions.push({
            id: `ws-${date}`,
            user_id: MOCK_USER_ID,
            template_id: planned.id,
            daily_log_id: logId,
            date,
            status: "completed",
            started_at: `${date}T18:00:00Z`,
            completed_at: `${date}T19:15:00Z`,
            duration_seconds: 4500,
            label: planned.name,
            notes: null,
            created_at: `${date}T18:00:00Z`,
            template: planned,
          });
        }
      }
    }
    return existing;
  }

  updateDailyLog(date: string, patch: DailyLogPatch): DailyLog {
    const log = this.getOrCreateDailyLog(date);
    if (patch.day_type !== undefined) log.day_type = patch.day_type;
    if (patch.sleep_start !== undefined) log.sleep_start = patch.sleep_start;
    if (patch.sleep_end !== undefined) log.sleep_end = patch.sleep_end;
    if (patch.sleep_quality !== undefined) log.sleep_quality = patch.sleep_quality;
    if (patch.activity_level !== undefined) log.activity_level = patch.activity_level;
    if (patch.calories !== undefined) log.calories = patch.calories;
    if (patch.protein !== undefined) log.protein = patch.protein;
    if (patch.carbs !== undefined) log.carbs = patch.carbs;
    if (patch.fat !== undefined) log.fat = patch.fat;
    if (patch.last_meal_at !== undefined) log.last_meal_at = patch.last_meal_at;
    if (patch.meal_cutoff_hit !== undefined) log.meal_cutoff_hit = patch.meal_cutoff_hit;
    if (patch.notes !== undefined) log.notes = patch.notes;

    if (log.sleep_start && log.sleep_end) {
      log.sleep_minutes = calculateSleepMinutes(log.sleep_start, log.sleep_end);
    }
    log.updated_at = new Date().toISOString();
    return log;
  }

  listDailyLogsByWeek(weekId: string): DailyLog[] {
    return this.dailyLogs
      .filter((l) => l.week_id === weekId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  listMealTimes(logId: string): MealTime[] {
    return this.mealTimes
      .filter((m) => m.daily_log_id === logId)
      .sort((a, b) => a.position - b.position);
  }

  replaceMealTimes(logId: string, times: string[]): MealTime[] {
    this.mealTimes = this.mealTimes.filter((m) => m.daily_log_id !== logId);
    const newItems = times.map((time, idx) => ({
      id: `meal-${logId}-${idx}-${Date.now()}`,
      daily_log_id: logId,
      time,
      position: idx,
    }));
    this.mealTimes.push(...newItems);
    return newItems;
  }

  addCardioSession(logId: string, input: Partial<CardioSession>): CardioSession {
    const item: CardioSession = {
      id: `cardio-${Date.now()}`,
      daily_log_id: logId,
      user_id: MOCK_USER_ID,
      type: input.type ?? "bike",
      minutes: input.minutes ?? 30,
      rpe: input.rpe ?? 8,
      timing: input.timing ?? "after_workout",
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
    };
    this.cardioSessions.push(item);
    return item;
  }

  deleteCardioSession(id: string) {
    this.cardioSessions = this.cardioSessions.filter((c) => c.id !== id);
  }

  listCardioByLog(logId: string): CardioSession[] {
    return this.cardioSessions.filter((c) => c.daily_log_id === logId);
  }

  listCardioByWeek(dates: string[]): Array<CardioSession & { daily_logs?: { date: string } }> {
    const logsInDates = this.dailyLogs.filter((l) => dates.includes(l.date));
    const logIdMap = new Map(logsInDates.map((l) => [l.id, l.date]));
    return this.cardioSessions
      .filter((c) => logIdMap.has(c.daily_log_id))
      .map((c) => ({
        ...c,
        daily_logs: { date: logIdMap.get(c.daily_log_id)! },
      }));
  }

  listWeightLogs(options?: { limit?: number; start?: string; end?: string }): WeightLog[] {
    let list = [...this.weightLogs].sort((a, b) => b.date.localeCompare(a.date));
    if (options?.start && options?.end) {
      list = list.filter((w) => w.date >= options.start! && w.date <= options.end!);
    }
    if (options?.limit) {
      list = list.slice(0, options.limit);
    }
    return list;
  }

  latestWeight(): WeightLog | null {
    const sorted = [...this.weightLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] ?? null;
  }

  upsertWeightLog(input: { date: string; weight: number; fasted?: boolean; notes?: string | null }): WeightLog {
    const existing = this.weightLogs.find((w) => w.date === input.date);
    if (existing) {
      existing.weight = input.weight;
      if (input.fasted !== undefined) existing.fasted = input.fasted;
      if (input.notes !== undefined) existing.notes = input.notes;
      return existing;
    }
    const item: WeightLog = {
      id: `w-${Date.now()}`,
      user_id: MOCK_USER_ID,
      date: input.date,
      weight: input.weight,
      fasted: input.fasted ?? true,
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
    };
    this.weightLogs.push(item);
    return item;
  }

  listHealthNotes(): HealthNote[] {
    return [...this.healthNotes].sort((a, b) => b.date.localeCompare(a.date));
  }

  addHealthNote(input: Omit<HealthNote, "id" | "user_id">): HealthNote {
    const note: HealthNote = {
      id: `hn-${Date.now()}`,
      user_id: MOCK_USER_ID,
      ...input,
    };
    this.healthNotes.unshift(note);
    return note;
  }

  updateHealthNote(id: string, patch: Partial<HealthNote>): HealthNote {
    const note = this.healthNotes.find((n) => n.id === id);
    if (!note) throw new Error("Health note not found");
    Object.assign(note, patch);
    return note;
  }

  listPhotos(): ProgressPhoto[] {
    return [...this.photos];
  }

  addPhoto(input: Omit<ProgressPhoto, "id" | "user_id">): ProgressPhoto {
    const photo: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      user_id: MOCK_USER_ID,
      ...input,
    };
    this.photos.push(photo);
    return photo;
  }

  listExercises(): Exercise[] {
    return [...this.exercises];
  }

  listTemplateExercises(templateId: string): WorkoutTemplateExercise[] {
    return this.templateExercises
      .filter((te) => te.template_id === templateId)
      .map((te) => ({
        ...te,
        exercise: this.exercises.find((e) => e.id === te.exercise_id),
      }))
      .sort((a, b) => a.position - b.position);
  }

  listWorkoutSessionsInRange(start: string, end: string): WorkoutSession[] {
    return this.workoutSessions
      .filter((ws) => ws.date >= start && ws.date <= end)
      .map((ws) => ({
        ...ws,
        template: this.templates.find((t) => t.id === ws.template_id) ?? null,
      }));
  }

  getWorkoutSessionForDate(date: string): WorkoutSession | null {
    const ws = this.workoutSessions.find((s) => s.date === date);
    if (!ws) return null;
    return {
      ...ws,
      template: this.templates.find((t) => t.id === ws.template_id) ?? null,
    };
  }

  getWorkoutSessionDetail(id: string): {
    session: WorkoutSession | null;
    exercises: ExerciseSession[];
  } {
    const session = this.workoutSessions.find((s) => s.id === id) ?? null;
    const exercises = this.exerciseSessions
      .filter((es) => es.workout_session_id === id)
      .map((es) => ({
        ...es,
        exercise: this.exercises.find((e) => e.id === es.exercise_id),
        sets: this.exerciseSets.filter((s) => s.exercise_session_id === es.id),
      }));
    return {
      session: session ? { ...session, template: this.templates.find((t) => t.id === session.template_id) ?? null } : null,
      exercises,
    };
  }

  getPreviousBestMap(exerciseIds: string[], beforeDate: string): Map<string, { weight: number; reps: number }> {
    const map = new Map<string, { weight: number; reps: number }>();
    for (const exId of exerciseIds) {
      const exercise = this.exercises.find((e) => e.id === exId);
      const seedItem = SEED_EXERCISES.find((s) => s.name === exercise?.name);
      if (seedItem?.baseline?.[0]) {
        map.set(exId, seedItem.baseline[0]);
      }
    }
    return map;
  }

  getExerciseDetail(exerciseId: string) {
    const exercise = this.exercises.find((e) => e.id === exerciseId) ?? null;
    return { exercise, history: [] };
  }

  upsertWeeklyReport(payload: Partial<WeeklyReport>): WeeklyReport {
    const existingIndex = this.weeklyReports.findIndex((r) => r.week_id === payload.week_id);
    const report: WeeklyReport = {
      id: `report-${Date.now()}`,
      week_id: payload.week_id!,
      generated_at: new Date().toISOString(),
      training_score: payload.training_score ?? 0,
      nutrition_score: payload.nutrition_score ?? 0,
      cardio_score: payload.cardio_score ?? 0,
      sleep_score: payload.sleep_score ?? 0,
      routine_score: payload.routine_score ?? 0,
      general_score: payload.general_score ?? 0,
      verdict: payload.verdict ?? "good",
      summary: payload.summary ?? ({} as any),
    };
    if (existingIndex >= 0) {
      this.weeklyReports[existingIndex] = report;
    } else {
      this.weeklyReports.push(report);
    }
    return report;
  }
}

export const mockStore = new MockStore();