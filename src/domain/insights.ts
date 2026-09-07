import { minutesToHoursLabel } from "@/utils/dates";
import { formatNumber } from "@/utils/dates";

type InsightInput = {
  sleepAvg: number | null;
  prevSleepAvg: number | null;
  cardioMinutes: number;
  cardioGoal: number;
  proteinAvg: number | null;
  proteinTarget: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  calorieAvg: number | null;
  calorieTarget: number;
};

export function buildInsights(input: InsightInput) {
  const insights: string[] = [];

  if (input.sleepAvg != null && input.prevSleepAvg != null) {
    const delta = Math.round(input.sleepAvg - input.prevSleepAvg);
    if (delta !== 0) {
      const abs = minutesToHoursLabel(Math.abs(delta)).replace("h", "h ").replace(" ", "");
      const minutesOnly = `${Math.abs(delta)} min`;
      insights.push(
        delta > 0
          ? `Seu sono médio está ${minutesOnly} maior que na semana passada.`
          : `Seu sono médio está ${minutesOnly} menor que na semana passada.`,
      );
      void abs;
    }
  }

  if (input.cardioGoal > 0) {
    const pct = Math.round((input.cardioMinutes / input.cardioGoal) * 100);
    insights.push(`Você completou ${Math.min(pct, 999)}% do cardio semanal.`);
  }

  if (input.proteinAvg != null) {
    const delta = Math.round(input.proteinAvg - input.proteinTarget);
    if (delta < 0) {
      insights.push(`Proteína está ${Math.abs(delta)}g/dia abaixo da referência.`);
    } else if (delta > 0) {
      insights.push(`Proteína está ${delta}g/dia acima da referência.`);
    } else {
      insights.push("Proteína está exatamente na referência.");
    }
  }

  if (input.workoutsPlanned > 0) {
    insights.push(
      `Treinos da semana: ${input.workoutsCompleted}/${input.workoutsPlanned}.`,
    );
  }

  if (input.calorieAvg != null) {
    const delta = Math.round(input.calorieAvg - input.calorieTarget);
    insights.push(
      delta === 0
        ? "Calorias médias estão na meta."
        : `Calorias médias estão ${delta > 0 ? "+" : ""}${formatNumber(delta)} kcal vs meta.`,
    );
  }

  return insights.slice(0, 5);
}

export function reportReading(input: {
  generalScore: number;
  trainingAdherence: number | null;
  sleepAvg: number | null;
  sleepGoal: number;
  cardioMinutes: number;
  cardioGoal: number;
  proteinAvg: number | null;
  proteinTarget: number;
}) {
  const parts: string[] = [];
  if (input.generalScore >= 8) {
    parts.push("A semana foi bem executada e o padrão operacional se manteve consistente.");
  } else if (input.generalScore >= 6) {
    parts.push("A execução foi razoável, com espaço claro para ajustar 1 ou 2 frentes.");
  } else {
    parts.push("A semana ficou abaixo do padrão operacional. O foco deve ser consistência, não volume extra.");
  }

  if (input.sleepAvg != null && input.sleepAvg < input.sleepGoal - 30) {
    parts.push("O sono ficou abaixo da meta e provavelmente limitou recuperação.");
  }
  if (input.cardioMinutes < input.cardioGoal * 0.8) {
    parts.push("O cardio ficou aquém da cota semanal.");
  }
  if (input.proteinAvg != null && input.proteinAvg < input.proteinTarget - 8) {
    parts.push("A proteína média ficou abaixo da referência.");
  }
  if ((input.trainingAdherence ?? 0) >= 1) {
    parts.push("A grade de treino foi cumprida.");
  }

  return parts.join(" ");
}

export function reportConclusions(input: {
  workoutsMissed: number;
  sleepMin: number | null;
  mealCutoffRate: number | null;
  proteinAvg: number | null;
  proteinTarget: number;
}) {
  const items: string[] = [];
  if (input.workoutsMissed > 0) {
    items.push(`${input.workoutsMissed} treino(s) não foram concluídos.`);
  }
  if (input.sleepMin != null && input.sleepMin < 360) {
    items.push("Houve noite(s) com menos de 6h de sono.");
  }
  if (input.mealCutoffRate != null && input.mealCutoffRate < 0.8) {
    items.push("A janela de última refeição não foi consistente.");
  }
  if (input.proteinAvg != null && input.proteinAvg + 5 < input.proteinTarget) {
    items.push("A proteína média precisa subir para a referência.");
  }
  if (items.length === 0) {
    items.push("Nenhum desvio relevante foi identificado automaticamente.");
  }
  return items.slice(0, 4);
}

export function reportPriorities(input: {
  sleepAdherence: number | null;
  cardioAdherence: number | null;
  proteinAdherence: number | null;
  trainingAdherence: number | null;
}) {
  const ranked = [
    { key: "sono", value: input.sleepAdherence },
    { key: "cardio", value: input.cardioAdherence },
    { key: "proteína", value: input.proteinAdherence },
    { key: "treino", value: input.trainingAdherence },
  ]
    .filter((item) => item.value != null)
    .sort((a, b) => (a.value ?? 1) - (b.value ?? 1));

  if (ranked.length === 0) {
    return ["Registrar o dia com mais consistência para gerar prioridades melhores."];
  }

  return ranked.slice(0, 3).map((item) => `Elevar aderência de ${item.key} na próxima semana.`);
}
