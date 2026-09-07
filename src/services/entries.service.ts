import type { SupabaseClient } from "@supabase/supabase-js";
import type { HealthNote, ProgressPhoto, WeightLog } from "@/types";

export async function listWeightLogs(
  supabase: SupabaseClient,
  userId: string,
  options?: { start?: string; end?: string; limit?: number },
) {
  let query = supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (options?.start) query = query.gte("date", options.start);
  if (options?.end) query = query.lte("date", options.end);
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as WeightLog[];
}

export async function upsertWeightLog(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<WeightLog, "date" | "weight" | "fasted" | "notes">,
) {
  const { data, error } = await supabase
    .from("weight_logs")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date" })
    .select("*")
    .single();
  if (error) throw error;
  return data as WeightLog;
}

export async function latestWeight(supabase: SupabaseClient, userId: string) {
  const logs = await listWeightLogs(supabase, userId, { limit: 1 });
  return logs[0] ?? null;
}

export async function listHealthNotes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("health_notes")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HealthNote[];
}

export async function addHealthNote(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<HealthNote, "date" | "type" | "status" | "note">,
) {
  const { data, error } = await supabase
    .from("health_notes")
    .insert({ user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return data as HealthNote;
}

export async function updateHealthNote(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<HealthNote, "status" | "note" | "type">>,
) {
  const { error } = await supabase.from("health_notes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function listPhotos(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProgressPhoto[];
}

export async function addPhoto(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<ProgressPhoto, "date" | "weight" | "category" | "storage_path">,
) {
  const { data, error } = await supabase
    .from("progress_photos")
    .insert({ user_id: userId, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProgressPhoto;
}

export async function signedPhotoUrls(supabase: SupabaseClient, photos: ProgressPhoto[]) {
  return Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(photo.storage_path, 60 * 60);
      return { ...photo, signed_url: data?.signedUrl ?? null };
    }),
  );
}
