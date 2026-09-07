import { notFound } from "next/navigation";
import { SessionClient } from "@/app/(app)/treinos/sessao/[id]/session-client";
import { requireSession } from "@/lib/auth";
import { getPreviousBestMap, getWorkoutSessionDetail, listTemplateExercises } from "@/services/workout.service";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireSession();
  const detail = await getWorkoutSessionDetail(supabase, id);
  if (!detail.session || detail.session.user_id !== user.id) notFound();
  const previousMap = await getPreviousBestMap(
    supabase,
    user.id,
    detail.exercises.map((item) => item.exercise_id),
    detail.session.date,
  );
  const templateExercises = detail.session.template_id
    ? await listTemplateExercises(supabase, detail.session.template_id)
    : [];

  return (
    <SessionClient
      session={detail.session}
      exercises={detail.exercises}
      previousMap={Object.fromEntries(previousMap)}
      templateExercises={templateExercises}
    />
  );
}
