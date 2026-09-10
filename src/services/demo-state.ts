import {
  DEFAULT_ADHERENCE_WEIGHTS,
  DEFAULT_MEAL_PLAN,
  DEFAULT_MEAL_TIMES,
  DEFAULT_OFF_TARGETS,
  DEFAULT_ON_TARGETS,
  DEFAULT_USER_NAME,
  PROGRAM_START_DATE,
  CYCLE_START_DATE,
} from "@/domain/constants";
import { SEED_EXERCISES, SEED_TEMPLATES, WEEK1_LOGS } from "@/domain/program";
import { calculateSleepMinutes } from "@/domain/sleep";
import { buildWeekBounds, dayTypeForTemplate, plannedTemplateForDate } from "@/domain/week";
import { buildWeekSnapshot } from "@/services/analytics.service";
import { datesInRange, todayDateString } from "@/utils/dates";
import type {
  CardioSession,
  DailyLog,
  DailyLogPatch,
  Exercise,
  ExerciseSession,
  ExerciseSet,
  FitnessSettings,
  HealthNote,
  MealTime,
  Profile,
  ProgressPhoto,
  WeightLog,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from "@/types";

const USER_ID = "00000000-0000-0000-0000-000000000000";

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type Store = {
  profile: Profile;
  settings: FitnessSettings;
  templates: WorkoutTemplate[];
  templateExercises: WorkoutTemplateExercise[];
  exercises: Exercise[];
  logs: DailyLog[];
  meals: MealTime[];
  cardio: CardioSession[];
  workouts: WorkoutSession[];
  exerciseSessions: ExerciseSession[];
  sets: ExerciseSet[];
  weights: WeightLog[];
  notes: HealthNote[];
  photos: ProgressPhoto[];
};

function buildSeedStore(): Store {
  const now = new Date().toISOString();
  const exercises: Exercise[] = SEED_EXERCISES.map((item, index) => ({
    id: `ex-${index + 1}`,
    user_id: USER_ID,
    name: item.name,
    muscle_group: item.muscle,
  }));
  const exerciseByName = new Map(exercises.map((item) => [item.name, item]));

  const templates: WorkoutTemplate[] = SEED_TEMPLATES.map((item, index) => ({
    id: `tpl-${item.slug}`,
    user_id: USER_ID,
    name: item.name,
    slug: item.slug,
    order_index: index,
    is_rest: item.isRest,
  }));

  const templateExercises: WorkoutTemplateExercise[] = [];
  for (const template of SEED_TEMPLATES) {
    const templateId = `tpl-${template.slug}`;
    template.exercises.forEach((item, position) => {
      const exercise = exerciseByName.get(item.name);
      if (!exercise) return;
      templateExercises.push({
        id: `te-${template.slug}-${position}`,
        template_id: templateId,
        exercise_id: exercise.id,
        position,
        work_sets: item.workSets,
        rep_min: item.repMin,
        rep_max: item.repMax,
        rest_seconds: item.rest,
        instructions: item.instructions ?? null,
        exercise,
      });
    });
  }

  const settings: FitnessSettings = {
    user_id: USER_ID,
    weekly_cardio_goal: 200,
    cardio_rpe_goal: 8,
    sleep_goal_minutes: 450,
    meal_cutoff_time: "21:30",
    on_calories: DEFAULT_ON_TARGETS.calories,
    on_protein: DEFAULT_ON_TARGETS.protein,
    on_carbs: DEFAULT_ON_TARGETS.carbs,
    on_fat: DEFAULT_ON_TARGETS.fat,
    off_calories: DEFAULT_OFF_TARGETS.calories,
    off_protein: DEFAULT_OFF_TARGETS.protein,
    off_carbs: DEFAULT_OFF_TARGETS.carbs,
    off_fat: DEFAULT_OFF_TARGETS.fat,
    cycle_start_date: CYCLE_START_DATE,
    program_start_date: PROGRAM_START_DATE,
    meal_plan: DEFAULT_MEAL_PLAN,
    adherence_weights: DEFAULT_ADHERENCE_WEIGHTS,
    updated_at: now,
  };

  const store: Store = {
    profile: { id: USER_ID, name: DEFAULT_USER_NAME, created_at: now },
    settings,
    templates,
    templateExercises,
    exercises,
    logs: [],
    meals: [],
    cardio: [],
    workouts: [],
    exerciseSessions: [],
    sets: [],
    weights: [
      { id: "w-1", user_id: USER_ID, date: "2026-08-31", weight: 69.6, fasted: true, notes: null },
      { id: "w-2", user_id: USER_ID, date: "2026-09-07", weight: 69.0, fasted: true, notes: null },
    ],
    notes: [
      {
        id: "n-1",
        user_id: USER_ID,
        date: "2026-09-01",
        type: "discomfort",
        status: "active",
        note: "Incômodo entre bíceps e antebraço.",
      },
    ],
    photos: [],
  };

  for (const day of WEEK1_LOGS) {
    const log: DailyLog = {
      id: `log-${day.date}`,
      week_id: "week-1",
      user_id: USER_ID,
      date: day.date,
      day_type: day.dayType,
      sleep_start: day.sleepStart,
      sleep_end: day.sleepEnd,
      sleep_minutes: day.sleepMinutes,
      sleep_quality: null,
      activity_level: day.activity,
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fat: day.fat,
      last_meal_at: "21:30",
      meal_cutoff_hit: true,
      notes: null,
      created_at: now,
      updated_at: now,
    };
    store.logs.push(log);
    store.meals.push(
      ...DEFAULT_MEAL_TIMES.map((time, position) => ({
        id: `meal-${day.date}-${position}`,
        daily_log_id: log.id,
        time,
        position,
      })),
    );
    store.cardio.push(
      ...day.cardio.map((session, index) => ({
        id: `cardio-${day.date}-${index}`,
        daily_log_id: log.id,
        user_id: USER_ID,
        type: session.type,
        minutes: session.minutes,
        rpe: 8,
        timing: "other" as const,
        notes: null,
        created_at: now,
      })),
    );
    store.workouts.push({
      id: `ws-${day.date}`,
      user_id: USER_ID,
      template_id: null,
      daily_log_id: log.id,
      date: day.date,
      status: day.workout.status,
      started_at: null,
      completed_at: day.workout.status === "completed" ? `${day.date}T20:00:00Z` : null,
      duration_seconds: null,
      label: day.workout.label,
      notes: null,
    });
  }

  return store;
}

const globalStore = globalThis as typeof globalThis & { __ryvonDemo?: Store };

function store() {
  if (!globalStore.__ryvonDemo) {
    globalStore.__ryvonDemo = buildSeedStore();
  }
  return globalStore.__ryvonDemo;
}

function ensureLog(date: string) {
  const current = store();
  const existing = current.logs.find((log) => log.date === date);
  if (existing) return existing;
  const bounds = buildWeekBounds(date, current.settings.program_start_date);
  const template = plannedTemplateForDate(date, current.settings.cycle_start_date, current.templates);
  const now = new Date().toISOString();
  const log: DailyLog = {
    id: `log-${date}`,
    week_id: `week-${bounds.weekNumber}`,
    user_id: USER_ID,
    date,
    day_type: dayTypeForTemplate(template),
    sleep_start: null,
    sleep_end: null,
    sleep_minutes: null,
    sleep_quality: null,
    activity_level: null,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    last_meal_at: null,
    meal_cutoff_hit: null,
    notes: null,
    created_at: now,
    updated_at: now,
  };
  current.logs.push(log);
  current.meals.push(
    ...DEFAULT_MEAL_TIMES.map((time, position) => ({
      id: id("meal"),
      daily_log_id: log.id,
      time,
      position,
    })),
  );
  return log;
}

function weekFor(date: string) {
  const settings = store().settings;
  const bounds = buildWeekBounds(date, settings.program_start_date);
  return {
    id: `week-${bounds.weekNumber}`,
    user_id: USER_ID,
    week_number: bounds.weekNumber,
    start_date: bounds.startDate,
    end_date: bounds.endDate,
    notes: null,
    status: "open" as const,
  };
}

function snapshotForWeek(weekNumber: number) {
  const current = store();
  const start = new Date(`${PROGRAM_START_DATE}T12:00:00`);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const resolved = {
    id: `week-${weekNumber}`,
    user_id: USER_ID,
    week_number: weekNumber,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    notes: null,
    status: "open" as const,
  };

  datesInRange(resolved.start_date, resolved.end_date).forEach(ensureLog);
  const logs = current.logs.filter((log) => log.date >= resolved.start_date && log.date <= resolved.end_date);
  const cardio = current.cardio.filter((item) => logs.some((log) => log.id === item.daily_log_id));
  const workouts = current.workouts
    .filter((item) => item.date >= resolved.start_date && item.date <= resolved.end_date)
    .map((item) => ({
      ...item,
      template: current.templates.find((template) => template.id === item.template_id) ?? null,
    }));
  const weights = current.weights.filter((item) => item.date >= resolved.start_date && item.date <= resolved.end_date);
  return {
    week: resolved,
    snapshot: buildWeekSnapshot({ logs, cardio, workouts, weights, settings: current.settings, week: resolved }),
  };
}

export function demoLoadAppContext(date = todayDateString()) {
  const current = store();
  const log = ensureLog(date);
  return {
    profile: current.profile,
    settings: current.settings,
    week: weekFor(date),
    log,
    templates: current.templates,
  };
}

export function demoLoadToday(date: string) {
  const context = demoLoadAppContext(date);
  const current = store();
  return {
    ...context,
    meals: current.meals.filter((meal) => meal.daily_log_id === context.log.id),
    cardio: current.cardio.filter((item) => item.daily_log_id === context.log.id),
    session: current.workouts.find((item) => item.date === date) ?? null,
    weight: [...current.weights].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    planned: plannedTemplateForDate(date, current.settings.cycle_start_date, current.templates),
  };
}

export function demoLoadWeekView(weekNumber?: number) {
  const today = todayDateString();
  const currentWeek = weekFor(today);
  const selected = snapshotForWeek(weekNumber ?? currentWeek.week_number);
  const previous = selected.week.week_number > 1 ? snapshotForWeek(selected.week.week_number - 1) : null;
  const mealMap: Record<string, string[]> = {};
  for (const log of selected.snapshot.logs) {
    mealMap[log.date] = store()
      .meals.filter((meal) => meal.daily_log_id === log.id)
      .sort((a, b) => a.position - b.position)
      .map((meal) => meal.time.slice(0, 5));
  }
  return {
    profile: store().profile,
    settings: store().settings,
    week: selected.week,
    previous: previous?.week ?? null,
    snapshot: selected.snapshot,
    prevSnapshot: previous?.snapshot ?? null,
    templates: store().templates,
    dates: datesInRange(selected.week.start_date, selected.week.end_date),
    mealMap,
    currentWeekNumber: currentWeek.week_number,
  };
}

export function demoLoadDashboard() {
  const weekView = demoLoadWeekView();
  const weights = [...store().weights].sort((a, b) => b.date.localeCompare(a.date));
  return { ...weekView, weights, latestWeight: weights[0] ?? null };
}

export function demoLoadTraining() {
  const context = demoLoadAppContext();
  const current = store();
  const catalog = current.templates.map((template) => ({
    template,
    exercises: current.templateExercises.filter((item) => item.template_id === template.id),
  }));
  return {
    ...context,
    sessions: current.workouts.filter(
      (item) => item.date >= context.week.start_date && item.date <= context.week.end_date,
    ),
    catalog,
    exercises: current.exercises,
  };
}

export function demoLoadNotesAndPhotos() {
  return { notes: store().notes, photos: store().photos };
}

export function demoUpdateDailyLog(date: string, patch: DailyLogPatch) {
  const log = ensureLog(date);
  Object.assign(log, patch, { updated_at: new Date().toISOString() });
  if (patch.sleep_start !== undefined || patch.sleep_end !== undefined) {
    log.sleep_minutes = calculateSleepMinutes(log.sleep_start, log.sleep_end);
  }
  return log;
}

export function demoReplaceMeals(date: string, times: string[]) {
  const log = ensureLog(date);
  const current = store();
  current.meals = current.meals.filter((meal) => meal.daily_log_id !== log.id);
  current.meals.push(
    ...times.map((time, position) => ({
      id: id("meal"),
      daily_log_id: log.id,
      time,
      position,
    })),
  );
  return current.meals.filter((meal) => meal.daily_log_id === log.id);
}

export function demoAddCardio(
  date: string,
  payload: Pick<CardioSession, "type" | "minutes" | "rpe" | "timing" | "notes">,
) {
  const log = ensureLog(date);
  const session: CardioSession = {
    id: id("cardio"),
    daily_log_id: log.id,
    user_id: USER_ID,
    ...payload,
    created_at: new Date().toISOString(),
  };
  store().cardio.push(session);
  return session;
}

export function demoRemoveCardio(cardioId: string) {
  const current = store();
  current.cardio = current.cardio.filter((item) => item.id !== cardioId);
}

export function demoUpsertWeight(payload: Pick<WeightLog, "date" | "weight" | "fasted" | "notes">) {
  const current = store();
  const existing = current.weights.find((item) => item.date === payload.date);
  if (existing) {
    Object.assign(existing, payload);
    return existing;
  }
  const created: WeightLog = { id: id("w"), user_id: USER_ID, ...payload };
  current.weights.push(created);
  return created;
}

export function demoAddNote(payload: Pick<HealthNote, "date" | "type" | "status" | "note">) {
  const note: HealthNote = { id: id("n"), user_id: USER_ID, ...payload };
  store().notes.unshift(note);
  return note;
}

export function demoStartWorkout(date: string) {
  const current = store();
  const log = ensureLog(date);
  const template = plannedTemplateForDate(date, current.settings.cycle_start_date, current.templates);
  if (!template) throw new Error("Nenhum treino programado.");
  const existing = current.workouts.find((item) => item.date === date);
  if (existing && (existing.status === "in_progress" || existing.status === "completed")) {
    return { ...existing, template };
  }
  const session: WorkoutSession = {
    id: existing?.id ?? id("ws"),
    user_id: USER_ID,
    template_id: template.id,
    daily_log_id: log.id,
    date,
    status: template.is_rest ? "completed" : "in_progress",
    started_at: new Date().toISOString(),
    completed_at: template.is_rest ? new Date().toISOString() : null,
    duration_seconds: null,
    label: template.name,
    notes: null,
    template,
  };
  if (existing) {
    Object.assign(existing, session);
  } else {
    current.workouts.push(session);
  }
  if (!template.is_rest && !current.exerciseSessions.some((item) => item.workout_session_id === session.id)) {
    const rows = current.templateExercises.filter((item) => item.template_id === template.id);
    for (const row of rows) {
      const exerciseSession: ExerciseSession = {
        id: id("es"),
        workout_session_id: session.id,
        exercise_id: row.exercise_id,
        status: "pending",
        position: row.position,
        exercise: current.exercises.find((item) => item.id === row.exercise_id),
        sets: [],
      };
      current.exerciseSessions.push(exerciseSession);
      for (let index = 0; index < row.work_sets; index += 1) {
        const set: ExerciseSet = {
          id: id("set"),
          exercise_session_id: exerciseSession.id,
          set_number: index + 1,
          weight: null,
          reps: null,
          rir: null,
          set_type: "work",
        };
        current.sets.push(set);
        exerciseSession.sets?.push(set);
      }
    }
  }
  return session;
}

export function demoMarkWorkout(sessionId: string, status: WorkoutSessionStatus) {
  const session = store().workouts.find((item) => item.id === sessionId);
  if (session) {
    session.status = status;
    session.completed_at = status === "completed" ? new Date().toISOString() : session.completed_at;
  }
}

export function demoGetWorkoutDetail(sessionId: string) {
  const current = store();
  const session = current.workouts.find((item) => item.id === sessionId);
  if (!session) return null;
  const exercises = current.exerciseSessions
    .filter((item) => item.workout_session_id === sessionId)
    .map((item) => ({
      ...item,
      exercise: current.exercises.find((exercise) => exercise.id === item.exercise_id),
      sets: current.sets.filter((set) => set.exercise_session_id === item.id).sort((a, b) => a.set_number - b.set_number),
    }));
  return {
    session: {
      ...session,
      template: current.templates.find((item) => item.id === session.template_id) ?? null,
    },
    exercises,
  };
}

export function demoUpdateSet(setId: string, patch: Partial<Pick<ExerciseSet, "weight" | "reps" | "rir">>) {
  const set = store().sets.find((item) => item.id === setId);
  if (set) Object.assign(set, patch);
}

export function demoCompleteExercise(exerciseSessionId: string) {
  const row = store().exerciseSessions.find((item) => item.id === exerciseSessionId);
  if (row) row.status = "completed";
}

export function demoFinishWorkout(sessionId: string, durationSeconds: number) {
  const session = store().workouts.find((item) => item.id === sessionId);
  if (session) {
    session.status = "completed";
    session.completed_at = new Date().toISOString();
    session.duration_seconds = durationSeconds;
  }
}

export function demoUpdateSettings(name: string, patch: Partial<FitnessSettings>) {
  store().profile.name = name;
  Object.assign(store().settings, patch);
}

export function demoUpdateTemplateExercise(
  rowId: string,
  patch: Partial<Pick<WorkoutTemplateExercise, "work_sets" | "rep_min" | "rep_max" | "rest_seconds">>,
) {
  const row = store().templateExercises.find((item) => item.id === rowId);
  if (row) Object.assign(row, patch);
}

export function demoPreviousSets(exerciseId: string, beforeDate: string) {
  const current = store();
  const session = current.exerciseSessions
    .map((item) => ({
      item,
      workout: current.workouts.find((workout) => workout.id === item.workout_session_id),
    }))
    .filter((row) => row.item.exercise_id === exerciseId && row.workout && row.workout.date < beforeDate && row.workout.status === "completed")
    .sort((a, b) => (b.workout?.date ?? "").localeCompare(a.workout?.date ?? ""))[0];
  return session ? current.sets.filter((set) => set.exercise_session_id === session.item.id) : [];
}

export function demoExerciseHistory(exerciseId: string) {
  const current = store();
  return current.exerciseSessions
    .filter((item) => item.exercise_id === exerciseId)
    .map((item) => ({
      exercise: current.exercises.find((exercise) => exercise.id === item.exercise_id) ?? null,
      workout_sessions: {
        date: current.workouts.find((workout) => workout.id === item.workout_session_id)?.date ?? "",
      },
      exercise_sets: current.sets.filter((set) => set.exercise_session_id === item.id),
    }))
    .filter((item) => item.workout_sessions.date);
}

export function demoUserId() {
  return USER_ID;
}
