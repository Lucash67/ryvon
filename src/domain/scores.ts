import { clamp } from "@/utils/format";
import type { WeekBlockStatus, WeekVerdict } from "@/types";

export function scoreFromAdherence(value: number | null) {
  if (value == null) return 0;
  return Number((clamp(value, 0, 1) * 10).toFixed(1));
}

export function verdictFromScore(score: number): WeekVerdict {
  if (score >= 8.5) return "excellent";
  if (score >= 7) return "good";
  if (score >= 5) return "regular";
  return "poor";
}

export function verdictLabel(verdict: WeekVerdict) {
  switch (verdict) {
    case "excellent":
      return "Excelente";
    case "good":
      return "Boa";
    case "regular":
      return "Regular";
    case "poor":
      return "Ruim";
  }
}

export function blockStatus(ratio: number | null): WeekBlockStatus {
  if (ratio == null) return "attention";
  if (ratio >= 0.8) return "on_track";
  if (ratio >= 0.5) return "attention";
  return "below";
}

export function blockStatusLabel(status: WeekBlockStatus) {
  switch (status) {
    case "on_track":
      return "Em dia";
    case "attention":
      return "Atenção";
    case "below":
      return "Abaixo da meta";
  }
}
