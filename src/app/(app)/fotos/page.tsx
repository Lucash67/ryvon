import { FotosClient } from "@/app/(app)/fotos/fotos-client";
import { requireSession } from "@/lib/auth";
import { loadNotesAndPhotos } from "@/services/loaders";

export default async function FotosPage() {
  const { supabase, user } = await requireSession();
  const { photos } = await loadNotesAndPhotos(supabase, user.id);
  return <FotosClient photos={photos} />;
}
