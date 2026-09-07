import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_MEAL_PLAN } from "@/domain/constants";
import type { FitnessSettings, MealPlan, Profile } from "@/types";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function getSettings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("fitness_settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  const settings = data as FitnessSettings;
  if (!settings.meal_plan?.on) {
    settings.meal_plan = DEFAULT_MEAL_PLAN;
  }
  return settings;
}

export async function updateProfileName(supabase: SupabaseClient, userId: string, name: string) {
  const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
  if (error) throw error;
}

export async function updateSettings(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<FitnessSettings>,
) {
  const { error } = await supabase.from("fitness_settings").update(patch).eq("user_id", userId);
  if (error) throw error;
}

export async function updateMealPlan(
  supabase: SupabaseClient,
  userId: string,
  mealPlan: MealPlan,
) {
  await updateSettings(supabase, userId, { meal_plan: mealPlan });
}

export async function getProfileAndSettings(supabase: SupabaseClient, userId: string) {
  const [profile, settings] = await Promise.all([
    getProfile(supabase, userId),
    getSettings(supabase, userId),
  ]);
  return { profile, settings };
}
