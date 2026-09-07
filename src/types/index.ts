export type DayType = "on" | "off";
export type ActivityLevel = "low" | "medium" | "high";
export type CardioType =
  | "walk"
  | "bike"
  | "stairs"
  | "run"
  | "treadmill"
  | "elliptical"
  | "swim"
  | "cycling"
  | "other";
export type CardioTiming = "before_workout" | "after_workout" | "other";
export type WorkoutSessionStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "missed"
  | "rescheduled"
  | "extra_rest";
export type ExerciseSessionStatus = "pending" | "in_progress" | "completed" | "skipped";
export type SetType = "warmup" | "prep" | "recognition" | "work";
export type PhotoCategory =
  | "relaxed_front"
  | "relaxed_side"
  | "relaxed_back"
  | "pose_front"
  | "pose_back"
  | "pose_side"
  | "other";
export type HealthNoteType =
  | "pain"
  | "discomfort"
  | "fatigue"
  | "illness"
  | "travel"
  | "different_gym"
  | "free_meal"
  | "event"
  | "other";
export type HealthNoteStatus = "active" | "improving" | "resolved";
export type WeekStatus = "open" | "closed";
export type WeekVerdict = "excellent" | "good" | "regular" | "poor";
export type WeekBlockStatus = "on_track" | "attention" | "below";
export type ProgressionKind = "rep_pr" | "load_pr" | "volume_pr" | "hold" | "drop";
export type SaveState = "idle" | "saving" | "saved" | "error";

export type AdherenceWeights = {
  training: number;
  nutrition: number;
  sleep: number;
  cardio: number;
  routine: number;
};

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPlanItem = {
  name: string;
  quantity?: string;
  optional?: boolean;
};

export type MealPlanMeal = {
  name: string;
  time: string;
  items: MealPlanItem[];
};

export type MealPlan = {
  on: MealPlanMeal[];
  off: MealPlanMeal[];
};

export type Profile = {
  id: string;
  name: string;
  created_at: string;
};

export type FitnessSettings = {
  user_id: string;
  weekly_cardio_goal: number;
  cardio_rpe_goal: number;
  sleep_goal_minutes: number;
  meal_cutoff_time: string;
  on_calories: number;
  on_protein: number;
  on_carbs: number;
  on_fat: number;
  off_calories: number;
  off_protein: number;
  off_carbs: number;
  off_fat: number;
  cycle_start_date: string;
  program_start_date: string;
  meal_plan: MealPlan;
  adherence_weights: AdherenceWeights;
  updated_at: string;
};

export type Week = {
  id: string;
  user_id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  notes: string | null;
  status: WeekStatus;
};

export type DailyLog = {
  id: string;
  week_id: string;
  user_id: string;
  date: string;
  day_type: DayType;
  sleep_start: string | null;
  sleep_end: string | null;
  sleep_minutes: number | null;
  sleep_quality: number | null;
  activity_level: ActivityLevel | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  last_meal_at: string | null;
  meal_cutoff_hit: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MealTime = {
  id: string;
  daily_log_id: string;
  time: string;
  position: number;
};

export type CardioSession = {
  id: string;
  daily_log_id: string;
  user_id: string;
  type: CardioType;
  minutes: number;
  rpe: number | null;
  timing: CardioTiming;
  notes: string | null;
  created_at: string;
};

export type WorkoutTemplate = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  order_index: number;
  is_rest: boolean;
};

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string;
};

export type WorkoutTemplateExercise = {
  id: string;
  template_id: string;
  exercise_id: string;
  position: number;
  work_sets: number;
  rep_min: number;
  rep_max: number;
  rest_seconds: number;
  instructions: string | null;
  exercise?: Exercise;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  template_id: string | null;
  daily_log_id: string | null;
  date: string;
  status: WorkoutSessionStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  label: string | null;
  notes: string | null;
  created_at?: string;
  template?: WorkoutTemplate | null;
};

export type ExerciseSession = {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  status: ExerciseSessionStatus;
  position: number;
  exercise?: Exercise;
  sets?: ExerciseSet[];
};

export type ExerciseSet = {
  id: string;
  exercise_session_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  set_type: SetType;
};

export type WeightLog = {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  fasted: boolean;
  notes: string | null;
  created_at?: string;
};

export type ProgressPhoto = {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  category: PhotoCategory;
  storage_path: string;
  signed_url?: string | null;
};

export type HealthNote = {
  id: string;
  user_id: string;
  date: string;
  type: HealthNoteType;
  status: HealthNoteStatus;
  note: string;
};

export type WeeklyReport = {
  id: string;
  week_id: string;
  generated_at: string;
  training_score: number;
  nutrition_score: number;
  cardio_score: number;
  sleep_score: number;
  routine_score: number;
  general_score: number;
  verdict: WeekVerdict;
  summary: WeeklyReportSummary;
};

export type WeeklyReportSummary = {
  calories_total: number | null;
  calories_avg: number | null;
  protein_avg: number | null;
  carbs_avg: number | null;
  fat_avg: number | null;
  sleep_avg_minutes: number | null;
  cardio_total: number;
  cardio_avg: number | null;
  workouts_planned: number;
  workouts_completed: number;
  workouts_missed: number;
  training_adherence: number;
  calorie_days_in_range: number;
  protein_days_in_range: number;
  meal_cutoff_days: number;
  days_logged: number;
  activity_avg: string | null;
  weekly_weight: number | null;
  reading: string;
  conclusions: string[];
  priorities: string[];
};

export type DailyLogPatch = Partial<
  Pick<
    DailyLog,
    | "sleep_start"
    | "sleep_end"
    | "sleep_quality"
    | "activity_level"
    | "calories"
    | "protein"
    | "carbs"
    | "fat"
    | "last_meal_at"
    | "meal_cutoff_hit"
    | "notes"
    | "day_type"
  >
>;

export type PreviousSetSummary = {
  weight: number | null;
  reps: number | null;
  rir: number | null;
};

export type ExerciseBest = {
  weight: number;
  reps: number;
  date: string;
};

export type ProgressionResult = {
  kind: ProgressionKind;
  label: string;
  previous: PreviousSetSummary | null;
  current: PreviousSetSummary | null;
};
