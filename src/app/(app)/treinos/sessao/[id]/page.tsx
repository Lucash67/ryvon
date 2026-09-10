import { notFound } from "next/navigation";
import { SessionClient } from "@/app/(app)/treinos/sessao/[id]/session-client";
import { requireSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { demoGetWorkoutDetail, demoLoadTraining, demoPreviousSets } from "@/services/demo-state";
import { getPreviousBestMap, getWorkoutSessionDetail, listTemplateExercises } from "@/services/workout.service";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireSession();
  const detail = isSupabaseConfigured() ? await getWorkoutSessionDetail(supabase, id) : demoGetWorkoutDetail(id);
  const session = detail?.session;
  if (!session || !detail || (isSupabaseConfigured() && session.user_id !== user.id)) notFound();
  const previousMap = isSupabaseConfigured()
    ? await getPreviousBestMap(
        supabase,
        user.id,
        detail.exercises.map((item) => item.exercise_id),
        session.date,
      )
    : new Map(detail.exercises.map((item) => [item.exercise_id, demoPreviousSets(item.exercise_id, session.date)]));
  const templateExercises = session.template_id
    ? isSupabaseConfigured()
      ? await listTemplateExercises(supabase, session.template_id)
      : demoLoadTraining().catalog.find((item) => item.template.id === session.template_id)?.exercises ?? []
    : [];

  return (
    <SessionClient
      session={session}
      exercises={detail.exercises}
      previousMap={Object.fromEntries(previousMap)}
      templateExercises={templateExercises}
    />
  );
}
