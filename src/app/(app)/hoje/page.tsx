import { HojeClient } from "@/app/(app)/hoje/hoje-client";
import { requireSession } from "@/lib/auth";
import { loadToday } from "@/services/loaders";
import { todayDateString } from "@/utils/dates";

export default async function HojePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { supabase, user } = await requireSession();
  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayDateString();
  const data = await loadToday(supabase, user.id, date);
  return (
    <HojeClient
      date={date}
      log={data.log}
      meals={data.meals}
      cardio={data.cardio}
      session={data.session}
      planned={data.planned}
      settings={data.settings}
    />
  );
}
