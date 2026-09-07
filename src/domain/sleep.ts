import { timeToMinutes } from "@/utils/dates";

export function calculateSleepMinutes(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) return null;
  const diff = endMinutes >= startMinutes ? endMinutes - startMinutes : 24 * 60 - startMinutes + endMinutes;
  return diff > 0 ? diff : null;
}

export function sleepTone(minutes: number | null) {
  if (minutes == null) return "neutral";
  if (minutes < 360) return "danger";
  if (minutes < 420) return "warning";
  return "success";
}
