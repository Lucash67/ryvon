import { formatNumber } from "@/utils/dates";

export function pct(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function signed(value: number, suffix = "", digits = 0) {
  const formatted = formatNumber(Math.abs(value), digits);
  if (value > 0) return `+${formatted}${suffix}`;
  if (value < 0) return `-${formatted}${suffix}`;
  return `${formatted}${suffix}`;
}

export function scoreLabel(score: number) {
  return score.toFixed(1).replace(".", ",");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => value != null && !Number.isNaN(value));
  if (valid.length === 0) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

export function mostCommon<T extends string>(values: T[]) {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
