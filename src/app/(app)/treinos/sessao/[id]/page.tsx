import { notFound } from "next/navigation";
import { SessionClient } from "@/app/(app)/treinos/sessao/[id]/session-client";
import { requireSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/runtime";
import { demoGetWorkoutDetail, demoLoadTraining, demoPreviousSets } from "@/services/demo-state";
import { getPreviousBestMap, getWorkoutSessionDetail, listTemplateExercises } from "@/services/workout.service";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireSession();
  const detail = isDemoMode() ? demoGetWorkoutDetail(id) : await getWorkoutSessionDetail(supabase, id);
  const session = detail?.session;
  if (!session || !detail || (!isDemoMode() && session.user_id !== user.id)) notFound();
  const previousMap = isDemoMode()
    ? new Map(detail.exercises.map((item) => [item.exercise_id, demoPreviousSets(item.exercise_id, session.date)]))
    : await getPreviousBestMap(
        supabase,
        user.id,
        detail.exercises.map((item) => item.exercise_id),
        session.date,
      );
  const templateExercises = session.template_id
    ? isDemoMode()
      ? demoLoadTraining().catalog.find((item) => item.template.id === session.template_id)?.exercises ?? []
      : await listTemplateExercises(supabase, session.template_id)
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
