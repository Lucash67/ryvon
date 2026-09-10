import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/runtime";
import { mockStore } from "@/lib/mock-store";
import type { HealthNote, ProgressPhoto, WeightLog } from "@/types";

export async function listWeightLogs(
  supabase: SupabaseClient,
  userId: string,
  options?: { start?: string; end?: string; limit?: number },
) {
  if (!isDemoMode()) {
    return mockStore.listWeightLogs(options);
  }
  try {
    let query = supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (options?.start) query = query.gte("date", options.start);
    if (options?.end) query = query.lte("date", options.end);
    if (options?.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockStore.listWeightLogs(options);
    return (data ?? []) as WeightLog[];
  } catch {
    return mockStore.listWeightLogs(options);
  }
}

export async function upsertWeightLog(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<WeightLog, "date" | "weight" | "fasted" | "notes">,
) {
  if (!isDemoMode()) {
    return mockStore.upsertWeightLog(payload);
  }
  try {
    const { data, error } = await supabase
      .from("weight_logs")
      .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date" })
      .select("*")
      .single();
    if (error) return mockStore.upsertWeightLog(payload);
    return data as WeightLog;
  } catch {
    return mockStore.upsertWeightLog(payload);
  }
}

export async function latestWeight(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return mockStore.latestWeight();
  }
  try {
    const logs = await listWeightLogs(supabase, userId, { limit: 1 });
    return logs[0] ?? mockStore.latestWeight();
  } catch {
    return mockStore.latestWeight();
  }
}

export async function listHealthNotes(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return mockStore.listHealthNotes();
  }
  try {
    const { data, error } = await supabase
      .from("health_notes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error || !data || data.length === 0) return mockStore.listHealthNotes();
    return (data ?? []) as HealthNote[];
  } catch {
    return mockStore.listHealthNotes();
  }
}

export async function addHealthNote(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<HealthNote, "date" | "type" | "status" | "note">,
) {
  if (!isDemoMode()) {
    return mockStore.addHealthNote(payload as any);
  }
  try {
    const { data, error } = await supabase
      .from("health_notes")
      .insert({ user_id: userId, ...payload })
      .select("*")
      .single();
    if (error) return mockStore.addHealthNote(payload as any);
    return data as HealthNote;
  } catch {
    return mockStore.addHealthNote(payload as any);
  }
}

export async function updateHealthNote(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<HealthNote, "status" | "note" | "type">>,
) {
  if (!isDemoMode()) {
    mockStore.updateHealthNote(id, patch as any);
    return;
  }
  const { error } = await supabase.from("health_notes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function listPhotos(supabase: SupabaseClient, userId: string) {
  if (!isDemoMode()) {
    return mockStore.listPhotos();
  }
  try {
    const { data, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) return mockStore.listPhotos();
    return (data ?? []) as ProgressPhoto[];
  } catch {
    return mockStore.listPhotos();
  }
}

export async function addPhoto(
  supabase: SupabaseClient,
  userId: string,
  payload: Pick<ProgressPhoto, "date" | "weight" | "category" | "storage_path">,
) {
  if (!isDemoMode()) {
    return mockStore.addPhoto(payload as any);
  }
  try {
    const { data, error } = await supabase
      .from("progress_photos")
      .insert({ user_id: userId, ...payload })
      .select("*")
      .single();
    if (error) return mockStore.addPhoto(payload as any);
    return data as ProgressPhoto;
  } catch {
    return mockStore.addPhoto(payload as any);
  }
}

export async function signedPhotoUrls(supabase: SupabaseClient, photos: ProgressPhoto[]) {
  if (!isDemoMode()) {
    return photos;
  }
  try {
    return Promise.all(
      photos.map(async (photo) => {
        const { data } = await supabase.storage
          .from("progress-photos")
          .createSignedUrl(photo.storage_path, 60 * 60);
        return { ...photo, signed_url: data?.signedUrl ?? null };
      }),
    );
  } catch {
    return photos;
  }
}