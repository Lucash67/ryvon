import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_MEAL_PLAN } from "@/domain/constants";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mock-store";
import type { FitnessSettings, MealPlan, Profile } from "@/types";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  if (!isSupabaseConfigured()) {
    return mockStore.getProfile();
  }
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return mockStore.getProfile();
    return data as Profile;
  } catch {
    return mockStore.getProfile();
  }
}

export async function getSettings(supabase: SupabaseClient, userId: string) {
  if (!isSupabaseConfigured()) {
    return mockStore.getSettings();
  }
  try {
    const { data, error } = await supabase
      .from("fitness_settings")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return mockStore.getSettings();
    const settings = data as FitnessSettings;
    if (!settings.meal_plan?.on) {
      settings.meal_plan = DEFAULT_MEAL_PLAN;
    }
    return settings;
  } catch {
    return mockStore.getSettings();
  }
}

export async function updateProfileName(supabase: SupabaseClient, userId: string, name: string) {
  if (!isSupabaseConfigured()) {
    mockStore.updateProfileName(name);
    return;
  }
  const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
  if (error) throw error;
}

export async function updateSettings(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<FitnessSettings>,
) {
  if (!isSupabaseConfigured()) {
    mockStore.updateSettings(patch);
    return;
  }
  const { error } = await supabase.from("fitness_settings").update(patch).eq("user_id", userId);
  if (error) throw error;
}

export async function updateMealPlan(
  supabase: SupabaseClient,
  userId: string,
  mealPlan: MealPlan,
) {
  if (!isSupabaseConfigured()) {
    mockStore.updateMealPlan(mealPlan);
    return;
  }
  await updateSettings(supabase, userId, { meal_plan: mealPlan });
}

export async function getProfileAndSettings(supabase: SupabaseClient, userId: string) {
  const [profile, settings] = await Promise.all([
    getProfile(supabase, userId),
    getSettings(supabase, userId),
  ]);
  return { profile, settings };
}
