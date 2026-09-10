"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { FormCard, FormRow, SectionHeader } from "@/components/v8";
import { saveSettingsAction, saveTemplateExerciseAction, signOutAction } from "@/app/actions";
import { isAuthDisabled } from "@/lib/flags";
import type { FitnessSettings, Profile, WorkoutTemplate, WorkoutTemplateExercise } from "@/types";

export function SettingsForm({
  profile,
  settings,
  catalog,
}: {
  profile: Profile;
  settings: FitnessSettings;
  catalog: Array<{ template: WorkoutTemplate; exercises: WorkoutTemplateExercise[] }>;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-4">
      <form
        className="space-y-4"
        action={async (formData) => {
          await saveSettingsAction({
            name: String(formData.get("name")),
            weekly_cardio_goal: Number(formData.get("weekly_cardio_goal")),
            cardio_rpe_goal: Number(formData.get("cardio_rpe_goal")),
            sleep_goal_minutes: Number(formData.get("sleep_goal_minutes")),
            meal_cutoff_time: String(formData.get("meal_cutoff_time")),
            on_calories: Number(formData.get("on_calories")),
            on_protein: Number(formData.get("on_protein")),
            on_carbs: Number(formData.get("on_carbs")),
            on_fat: Number(formData.get("on_fat")),
            off_calories: Number(formData.get("off_calories")),
            off_protein: Number(formData.get("off_protein")),
            off_carbs: Number(formData.get("off_carbs")),
            off_fat: Number(formData.get("off_fat")),
          });
          setMessage("Configurações salvas.");
        }}
      >
        <div className="grid gap-[14px] lg:grid-cols-2">
          <FormCard title="Metas">
            <FormRow>
              <Field label="Nome" name="name" defaultValue={profile.name} />
              <Field label="Meta de cardio (min)" name="weekly_cardio_goal" type="number" defaultValue={settings.weekly_cardio_goal} />
              <Field label="RPE cardio" name="cardio_rpe_goal" type="number" defaultValue={settings.cardio_rpe_goal} />
              <Field label="Meta de sono (min)" name="sleep_goal_minutes" type="number" defaultValue={settings.sleep_goal_minutes} />
              <Field label="Horário limite" name="meal_cutoff_time" type="time" defaultValue={settings.meal_cutoff_time.slice(0, 5)} />
            </FormRow>
          </FormCard>
          <FormCard title="Macros">
            <p className="mb-2 text-[11px] text-muted uppercase">Day On</p>
            <FormRow>
              <Field label="Calorias" name="on_calories" type="number" defaultValue={settings.on_calories} />
              <Field label="Proteína" name="on_protein" type="number" defaultValue={settings.on_protein} />
              <Field label="Carboidratos" name="on_carbs" type="number" defaultValue={settings.on_carbs} />
              <Field label="Gordura" name="on_fat" type="number" defaultValue={settings.on_fat} />
            </FormRow>
            <p className="mb-2 mt-3 text-[11px] text-muted uppercase">Day Off</p>
            <FormRow>
              <Field label="Calorias" name="off_calories" type="number" defaultValue={settings.off_calories} />
              <Field label="Proteína" name="off_protein" type="number" defaultValue={settings.off_protein} />
              <Field label="Carboidratos" name="off_carbs" type="number" defaultValue={settings.off_carbs} />
              <Field label="Gordura" name="off_fat" type="number" defaultValue={settings.off_fat} />
            </FormRow>
          </FormCard>
        </div>
        <Button type="submit" className="mt-[14px]">Salvar configurações</Button>
        {message ? <p className="text-sm text-success">{message}</p> : null}
      </form>
      {isAuthDisabled() ? null : (
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      )}

      <SectionHeader title="Prescrição dos treinos" />
      {catalog.map(({ template, exercises }) => (
        <Card key={template.id} className="hover:translate-y-0">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((item) => (
              <form
                key={item.id}
                className="surface-muted grid gap-2 rounded-xl p-3 sm:grid-cols-4"
                action={async (formData) => {
                  await saveTemplateExerciseAction(item.id, {
                    work_sets: Number(formData.get("work_sets")),
                    rep_min: Number(formData.get("rep_min")),
                    rep_max: Number(formData.get("rep_max")),
                    rest_seconds: Number(formData.get("rest_seconds")),
                  });
                }}
              >
                <p className="sm:col-span-4 text-sm font-medium">{item.exercise?.name}</p>
                <Input name="work_sets" type="number" defaultValue={item.work_sets} />
                <Input name="rep_min" type="number" defaultValue={item.rep_min} />
                <Input name="rep_max" type="number" defaultValue={item.rep_max} />
                <Input name="rest_seconds" type="number" defaultValue={item.rest_seconds} />
                <Button type="submit" size="sm" variant="outline">
                  Atualizar
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={defaultValue} required />
    </div>
  );
}
