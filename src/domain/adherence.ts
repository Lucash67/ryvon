import {
  CALORIE_IN_RANGE_TOLERANCE,
  DEFAULT_ADHERENCE_WEIGHTS,
  PROTEIN_IN_RANGE_TOLERANCE,
} from "@/domain/constants";
import { clamp } from "@/utils/format";
import type { AdherenceWeights, DailyLog, MacroTargets } from "@/types";

export function ratioAdherence(actual: number | null, goal: number) {
  if (actual == null || goal <= 0) return null;
  return clamp(actual / goal, 0, 1);
}

export function proximityAdherence(actual: number | null, goal: number) {
  if (actual == null || goal <= 0) return null;
  return clamp(1 - Math.abs(actual - goal) / goal, 0, 1);
}

export function trainingAdherence(completed: number, planned: number) {
  if (planned <= 0) return completed > 0 ? 1 : null;
  return clamp(completed / planned, 0, 1.5);
}

export function cardioAdherence(minutes: number, goal: number) {
  return ratioAdherence(minutes, goal);
}

export function calorieAdherence(averageCalories: number | null, target: number) {
  return proximityAdherence(averageCalories, target);
}

export function proteinAdherence(averageProtein: number | null, target: number) {
  return ratioAdherence(averageProtein, target);
}

export function sleepAdherence(averageMinutes: number | null, goalMinutes: number) {
  return ratioAdherence(averageMinutes, goalMinutes);
}

export function mealTimeAdherence(hitDays: number, loggedDays: number) {
  if (loggedDays <= 0) return null;
  return clamp(hitDays / loggedDays, 0, 1);
}

export function generalAdherence(
  parts: {
    training: number | null;
    nutrition: number | null;
    sleep: number | null;
    cardio: number | null;
    routine: number | null;
  },
  weights: AdherenceWeights = DEFAULT_ADHERENCE_WEIGHTS,
) {
  const entries: Array<[keyof AdherenceWeights, number | null]> = [
    ["training", parts.training],
    ["nutrition", parts.nutrition],
    ["sleep", parts.sleep],
    ["cardio", parts.cardio],
    ["routine", parts.routine],
  ];

  let weighted = 0;
  let totalWeight = 0;
  for (const [key, value] of entries) {
    if (value == null) continue;
    weighted += clamp(value, 0, 1) * weights[key];
    totalWeight += weights[key];
  }
  if (totalWeight === 0) return null;
  return weighted / totalWeight;
}

export function nutritionBlend(calorie: number | null, protein: number | null) {
  const values = [calorie, protein].filter((value): value is number => value != null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function isCalorieInRange(calories: number | null, target: MacroTargets["calories"]) {
  if (calories == null) return false;
  return Math.abs(calories - target) / target <= CALORIE_IN_RANGE_TOLERANCE;
}

export function isProteinInRange(protein: number | null, target: MacroTargets["protein"]) {
  if (protein == null) return false;
  return Math.abs(protein - target) / target <= PROTEIN_IN_RANGE_TOLERANCE;
}

export function targetsForDay(dayType: DailyLog["day_type"], on: MacroTargets, off: MacroTargets) {
  return dayType === "on" ? on : off;
}

export function visualCap(value: number | null) {
  if (value == null) return 0;
  return clamp(value, 0, 1);
}
