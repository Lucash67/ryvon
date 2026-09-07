import { z } from "zod";

const optionalNumber = (min: number, max = 100000) =>
  z
    .union([z.number(), z.nan(), z.null(), z.undefined(), z.literal("")])
    .transform((value) => {
      if (value === "" || value == null || Number.isNaN(value)) return null;
      return Number(value);
    })
    .refine((value) => value == null || (value >= min && value <= max), {
      message: "Valor inválido",
    });

export const sleepSchema = z
  .object({
    sleep_start: z.string().nullable().optional(),
    sleep_end: z.string().nullable().optional(),
    sleep_quality: optionalNumber(1, 5),
  })
  .superRefine((value, ctx) => {
    if (value.sleep_start && value.sleep_end && value.sleep_start === value.sleep_end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Início e fim do sono não podem ser iguais",
        path: ["sleep_end"],
      });
    }
  });

export const nutritionSchema = z.object({
  calories: optionalNumber(0),
  protein: optionalNumber(0),
  carbs: optionalNumber(0),
  fat: optionalNumber(0),
});

export const cardioSchema = z.object({
  type: z.enum([
    "walk",
    "bike",
    "stairs",
    "run",
    "treadmill",
    "elliptical",
    "swim",
    "cycling",
    "other",
  ]),
  minutes: z.number().positive("Minutos devem ser maiores que zero").max(600),
  rpe: z.number().min(1).max(10).nullable().optional(),
  timing: z.enum(["before_workout", "after_workout", "other"]),
  notes: z.string().max(500).nullable().optional(),
});

export const weightSchema = z.object({
  date: z.string().min(8),
  weight: z.number().positive("Peso deve ser maior que zero").max(400),
  fasted: z.boolean(),
  notes: z.string().max(300).nullable().optional(),
});

export const exerciseSetSchema = z.object({
  weight: optionalNumber(0, 1000),
  reps: optionalNumber(0, 100),
  rir: optionalNumber(0, 10),
});

export const healthNoteSchema = z.object({
  date: z.string().min(8),
  type: z.enum([
    "pain",
    "discomfort",
    "fatigue",
    "illness",
    "travel",
    "different_gym",
    "free_meal",
    "event",
    "other",
  ]),
  status: z.enum(["active", "improving", "resolved"]),
  note: z.string().min(2, "Descreva a ocorrência").max(1000),
});

export const settingsSchema = z.object({
  name: z.string().min(2).max(80),
  weekly_cardio_goal: z.number().min(0).max(2000),
  cardio_rpe_goal: z.number().min(1).max(10),
  sleep_goal_minutes: z.number().min(180).max(900),
  meal_cutoff_time: z.string().regex(/^\d{2}:\d{2}$/),
  on_calories: z.number().min(800).max(6000),
  on_protein: z.number().min(20).max(400),
  on_carbs: z.number().min(0).max(800),
  on_fat: z.number().min(0).max(300),
  off_calories: z.number().min(800).max(6000),
  off_protein: z.number().min(20).max(400),
  off_carbs: z.number().min(0).max(800),
  off_fat: z.number().min(0).max(300),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
