import { SemanaClient } from "@/app/(app)/semana/semana-client";
import { requireSession } from "@/lib/auth";
import { loadWeekView } from "@/services/loaders";

export default async function SemanaPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { supabase, user } = await requireSession();
  const params = await searchParams;
  const weekNumber = params.w ? Number(params.w) : undefined;
  const data = await loadWeekView(supabase, user.id, weekNumber);
  return (
    <SemanaClient
      week={data.week}
      snapshot={data.snapshot}
      prevSnapshot={data.prevSnapshot}
      mealMap={data.mealMap}
      settings={data.settings}
      currentWeekNumber={data.currentWeekNumber}
    />
  );
}
