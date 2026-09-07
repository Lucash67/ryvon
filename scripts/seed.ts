import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_ADHERENCE_WEIGHTS,
  DEFAULT_MEAL_PLAN,
  DEFAULT_MEAL_TIMES,
} from "../src/domain/constants";
import { SEED_EXERCISES, SEED_TEMPLATES, WEEK1_LOGS } from "../src/domain/program";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_EMAIL ?? "lucas@fitness-os.local";
const password = process.env.SEED_PASSWORD ?? "fitnessos";
const name = process.env.SEED_NAME ?? "Lucas";

if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list.users.find((user) => user.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw error ?? new Error("Falha ao criar usuário");
  return data.user.id;
}

async function main() {
  const userId = await ensureUser();
  console.log("Usuário:", email, userId);

  await supabase.from("profiles").upsert({ id: userId, name });
  await supabase.from("fitness_settings").upsert({
    user_id: userId,
    weekly_cardio_goal: 200,
    cardio_rpe_goal: 8,
    sleep_goal_minutes: 450,
    meal_cutoff_time: "21:30",
    on_calories: 2270,
    on_protein: 146,
    on_carbs: 322,
    on_fat: 44,
    off_calories: 2060,
    off_protein: 142,
    off_carbs: 279,
    off_fat: 43,
    cycle_start_date: "2026-09-07",
    program_start_date: "2026-08-30",
    meal_plan: DEFAULT_MEAL_PLAN,
    adherence_weights: DEFAULT_ADHERENCE_WEIGHTS,
  });

  for (const exercise of SEED_EXERCISES) {
    await supabase.from("exercises").upsert(
      { user_id: userId, name: exercise.name, muscle_group: exercise.muscle },
      { onConflict: "user_id,name" },
    );
  }

  const { data: exercises, error: exError } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", userId);
  if (exError) throw exError;
  const exerciseMap = new Map(exercises.map((item) => [item.name, item.id]));

  for (const [index, template] of SEED_TEMPLATES.entries()) {
    await supabase.from("workout_templates").upsert(
      {
        user_id: userId,
        name: template.name,
        slug: template.slug,
        order_index: index,
        is_rest: template.isRest,
      },
      { onConflict: "user_id,slug" },
    );
  }

  const { data: templates } = await supabase.from("workout_templates").select("*").eq("user_id", userId);
  const templateMap = new Map((templates ?? []).map((item) => [item.slug, item.id]));

  for (const template of SEED_TEMPLATES) {
    const templateId = templateMap.get(template.slug);
    if (!templateId) continue;
    await supabase.from("workout_template_exercises").delete().eq("template_id", templateId);
    if (template.exercises.length === 0) continue;
    await supabase.from("workout_template_exercises").insert(
      template.exercises.map((item, position) => ({
        template_id: templateId,
        exercise_id: exerciseMap.get(item.name),
        position,
        work_sets: item.workSets,
        rep_min: item.repMin,
        rep_max: item.repMax,
        rest_seconds: item.rest,
        instructions: item.instructions ?? null,
      })),
    );
  }

  const { data: week } = await supabase
    .from("weeks")
    .upsert(
      {
        user_id: userId,
        week_number: 1,
        start_date: "2026-08-30",
        end_date: "2026-09-05",
        status: "closed",
        notes: "Semana 1 — histórico inicial",
      },
      { onConflict: "user_id,week_number" },
    )
    .select("*")
    .single();

  await supabase.from("weeks").upsert(
    {
      user_id: userId,
      week_number: 2,
      start_date: "2026-09-06",
      end_date: "2026-09-12",
      status: "open",
    },
    { onConflict: "user_id,week_number" },
  );

  if (!week) throw new Error("Semana 1 não criada");

  for (const day of WEEK1_LOGS) {
    const { data: log } = await supabase
      .from("daily_logs")
      .upsert(
        {
          week_id: week.id,
          user_id: userId,
          date: day.date,
          day_type: day.dayType,
          sleep_start: day.sleepStart,
          sleep_end: day.sleepEnd,
          sleep_minutes: day.sleepMinutes,
          activity_level: day.activity,
          calories: day.calories,
          protein: day.protein,
          carbs: day.carbs,
          fat: day.fat,
          last_meal_at: "21:30",
          meal_cutoff_hit: true,
        },
        { onConflict: "user_id,date" },
      )
      .select("*")
      .single();
    if (!log) continue;

    await supabase.from("meal_times").delete().eq("daily_log_id", log.id);
    await supabase.from("meal_times").insert(
      DEFAULT_MEAL_TIMES.map((time, position) => ({
        daily_log_id: log.id,
        time,
        position,
      })),
    );

    await supabase.from("cardio_sessions").delete().eq("daily_log_id", log.id);
    if (day.cardio.length) {
      await supabase.from("cardio_sessions").insert(
        day.cardio.map((session) => ({
          daily_log_id: log.id,
          user_id: userId,
          type: session.type,
          minutes: session.minutes,
          rpe: 8,
          timing: "other",
        })),
      );
    }

    await supabase.from("workout_sessions").delete().eq("user_id", userId).eq("date", day.date);
    await supabase.from("workout_sessions").insert({
      user_id: userId,
      daily_log_id: log.id,
      date: day.date,
      status: day.workout.status,
      label: day.workout.label,
      completed_at: day.workout.status === "completed" ? `${day.date}T20:00:00Z` : null,
    });
  }

  await supabase.from("weight_logs").upsert(
    [
      { user_id: userId, date: "2026-08-31", weight: 69.6, fasted: true },
      { user_id: userId, date: "2026-09-07", weight: 69.0, fasted: true },
    ],
    { onConflict: "user_id,date" },
  );

  await supabase.from("health_notes").delete().eq("user_id", userId);
  await supabase.from("health_notes").insert({
    user_id: userId,
    date: "2026-09-01",
    type: "discomfort",
    status: "active",
    note: "Incômodo entre bíceps e antebraço.",
  });

  const { data: baselineSession } = await supabase
    .from("workout_sessions")
    .upsert(
      {
        user_id: userId,
        date: "2026-08-29",
        status: "completed",
        label: "Baseline",
        notes: "Cargas iniciais de referência",
        completed_at: "2026-08-29T18:00:00Z",
      },
      { onConflict: "user_id,date" },
    )
    .select("*")
    .single();

  if (baselineSession) {
    await supabase.from("exercise_sessions").delete().eq("workout_session_id", baselineSession.id);
    for (const exercise of SEED_EXERCISES.filter((item) => item.baseline?.length)) {
      const exerciseId = exerciseMap.get(exercise.name);
      if (!exerciseId) continue;
      const { data: session } = await supabase
        .from("exercise_sessions")
        .insert({
          workout_session_id: baselineSession.id,
          exercise_id: exerciseId,
          status: "completed",
          position: 0,
        })
        .select("*")
        .single();
      if (!session) continue;
      await supabase.from("exercise_sets").insert(
        (exercise.baseline ?? []).map((set, index) => ({
          exercise_session_id: session.id,
          set_number: index + 1,
          weight: set.weight,
          reps: set.reps,
          rir: 1,
          set_type: "work",
        })),
      );
    }
  }

  console.log("Seed concluído.");
  console.log(`Login: ${email}`);
  console.log(`Senha: ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
