"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { addCardioAction, saveDailyLogAction, saveHealthNoteAction, saveWeightAction, startWorkoutAction, uploadPhotoAction } from "@/app/actions";
import { CARDIO_LABELS, HEALTH_NOTE_LABELS, PHOTO_CATEGORY_LABELS } from "@/domain/constants";
import { todayDateString } from "@/utils/dates";
import type { CardioType, HealthNoteType } from "@/types";

type Mode = "menu" | "weight" | "cardio" | "nutrition" | "sleep" | "photo" | "note";

export function QuickEntry() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const date = useMemo(() => todayDateString(), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMode("menu");
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    setOpen(false);
    setMode("menu");
  }

  return (
    <>
      <button
        onClick={() => {
          setMode("menu");
          setOpen(true);
        }}
        className="no-print btn-primary-gradient fixed bottom-[88px] right-[14px] z-40 flex h-14 min-w-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold lg:bottom-8 lg:right-6"
      >
        <Plus className="h-5 w-5" />
        Registrar
      </button>

      {mode === "menu" ? (
        <Dialog open={open} onClose={close} title="Registrar">
          <Command className="outline-none">
            <Command.Input
              placeholder="Buscar..."
              className="mb-3 h-11 w-full rounded-xl border border-border px-3 text-base outline-none"
            />
            <Command.List className="space-y-1">
              {[
                { id: "weight", label: "Peso" },
                { id: "cardio", label: "Cardio" },
                { id: "nutrition", label: "Nutrição" },
                { id: "sleep", label: "Sono" },
                { id: "workout", label: "Treino" },
                { id: "photo", label: "Foto" },
                { id: "note", label: "Observação" },
              ].map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={async () => {
                    if (item.id === "workout") {
                      const session = await startWorkoutAction(date);
                      close();
                      router.push(`/treinos/sessao/${session.id}`);
                      return;
                    }
                    setMode(item.id as Mode);
                  }}
                  className="cursor-pointer rounded-xl px-3 py-3 text-sm data-[selected=true]:bg-primary/15 data-[selected=true]:text-foreground"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Dialog>
      ) : (
        <Dialog
          open={open}
          onClose={close}
          title={
            mode === "weight"
              ? "Peso"
              : mode === "cardio"
                ? "Cardio"
                : mode === "nutrition"
                  ? "Nutrição"
                  : mode === "sleep"
                    ? "Sono"
                    : mode === "photo"
                      ? "Foto"
                      : "Observação"
          }
        >
          {mode === "weight" && <WeightForm date={date} onDone={close} />}
          {mode === "cardio" && <CardioForm date={date} onDone={close} />}
          {mode === "nutrition" && <NutritionForm date={date} onDone={close} />}
          {mode === "sleep" && <SleepForm date={date} onDone={close} />}
          {mode === "photo" && <PhotoForm date={date} onDone={close} />}
          {mode === "note" && <NoteForm date={date} onDone={close} />}
        </Dialog>
      )}
    </>
  );
}

function WeightForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        await saveWeightAction({
          date,
          weight: Number(formData.get("weight")),
          fasted: formData.get("fasted") === "on",
        });
        onDone();
      }}
    >
      <div>
        <Label>Peso (kg)</Label>
        <Input name="weight" type="number" inputMode="decimal" step="0.1" min="1" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="fasted" type="checkbox" defaultChecked className="h-4 w-4" />
        Jejum
      </label>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}

function CardioForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        await addCardioAction(date, {
          type: String(formData.get("type")) as CardioType,
          minutes: Number(formData.get("minutes")),
          rpe: Number(formData.get("rpe")),
          timing: "other",
          notes: String(formData.get("notes") || "") || null,
        });
        onDone();
      }}
    >
      <div>
        <Label>Modalidade</Label>
        <select name="type" className="h-11 w-full rounded-xl border border-border px-3">
          {Object.entries(CARDIO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Minutos</Label>
          <Input name="minutes" type="number" inputMode="numeric" min="1" required />
        </div>
        <div>
          <Label>RPE</Label>
          <Input name="rpe" type="number" inputMode="numeric" min="1" max="10" defaultValue="8" />
        </div>
      </div>
      <div>
        <Label>Observação</Label>
        <Input name="notes" />
      </div>
      <Button type="submit" className="w-full">
        Adicionar
      </Button>
    </form>
  );
}

function NutritionForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        await saveDailyLogAction(date, {
          calories: Number(formData.get("calories")),
          protein: Number(formData.get("protein")),
          carbs: Number(formData.get("carbs")),
          fat: Number(formData.get("fat")),
        });
        onDone();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Calorias</Label>
          <Input name="calories" type="number" inputMode="numeric" min="0" required />
        </div>
        <div>
          <Label>Proteína</Label>
          <Input name="protein" type="number" inputMode="decimal" min="0" required />
        </div>
        <div>
          <Label>Carboidratos</Label>
          <Input name="carbs" type="number" inputMode="decimal" min="0" required />
        </div>
        <div>
          <Label>Gorduras</Label>
          <Input name="fat" type="number" inputMode="decimal" min="0" required />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}

function SleepForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        await saveDailyLogAction(date, {
          sleep_start: String(formData.get("sleep_start")),
          sleep_end: String(formData.get("sleep_end")),
          sleep_quality: Number(formData.get("sleep_quality")),
        });
        onDone();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Dormiu</Label>
          <Input name="sleep_start" type="time" required />
        </div>
        <div>
          <Label>Acordou</Label>
          <Input name="sleep_end" type="time" required />
        </div>
      </div>
      <div>
        <Label>Qualidade (1–5)</Label>
        <Input name="sleep_quality" type="number" inputMode="numeric" min="1" max="5" defaultValue="4" />
      </div>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}

function PhotoForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        formData.set("date", date);
        await uploadPhotoAction(formData);
        onDone();
      }}
    >
      <div>
        <Label>Categoria</Label>
        <select name="category" className="h-11 w-full rounded-xl border border-border px-3">
          {Object.entries(PHOTO_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Foto</Label>
        <Input name="file" type="file" accept="image/*" required />
      </div>
      <div>
        <Label>Peso no dia (opcional)</Label>
        <Input name="weight" type="number" inputMode="decimal" step="0.1" />
      </div>
      <Button type="submit" className="w-full">
        Enviar
      </Button>
    </form>
  );
}

function NoteForm({ date, onDone }: { date: string; onDone: () => void }) {
  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        await saveHealthNoteAction({
          date,
          type: String(formData.get("type")) as HealthNoteType,
          status: "active",
          note: String(formData.get("note")),
        });
        onDone();
      }}
    >
      <div>
        <Label>Tipo</Label>
        <select name="type" className="h-11 w-full rounded-xl border border-border px-3">
          {Object.entries(HEALTH_NOTE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Observação</Label>
        <Textarea name="note" required />
      </div>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}
