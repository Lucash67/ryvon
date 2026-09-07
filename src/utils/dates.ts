import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { PROGRAM_START_DATE } from "@/domain/constants";

export function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(value: string) {
  return parseISO(value.length === 10 ? `${value}T12:00:00` : value);
}

export function todayDateString(now = new Date()) {
  return toDateString(now);
}

export function weekStart(date: Date | string) {
  const value = typeof date === "string" ? parseDate(date) : date;
  return startOfWeek(value, { weekStartsOn: 0 });
}

export function weekEnd(date: Date | string) {
  return addDays(weekStart(date), 6);
}

export function weekNumberForDate(date: Date | string, programStart = PROGRAM_START_DATE) {
  const start = weekStart(programStart);
  const current = weekStart(date);
  return Math.floor(differenceInCalendarDays(current, start) / 7) + 1;
}

export function weekRangeLabel(start: string, end: string) {
  return `${format(parseDate(start), "dd/MM")} – ${format(parseDate(end), "dd/MM")}`;
}

export function formatLongDate(date: string | Date) {
  return format(typeof date === "string" ? parseDate(date) : date, "dd MMMM", {
    locale: ptBR,
  }).toUpperCase();
}

export function formatWeekday(date: string | Date) {
  return format(typeof date === "string" ? parseDate(date) : date, "EEEE", {
    locale: ptBR,
  }).toUpperCase();
}

export function formatShortDate(date: string | Date) {
  return format(typeof date === "string" ? parseDate(date) : date, "dd/MM");
}

export function datesInRange(start: string, end: string) {
  const dates: string[] = [];
  let cursor = parseDate(start);
  const last = parseDate(end);
  while (cursor <= last) {
    dates.push(toDateString(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function minutesToHoursLabel(minutes: number | null | undefined) {
  if (minutes == null || Number.isNaN(minutes)) return "—";
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h${String(mins).padStart(2, "0")}`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatDeltaKg(value: number) {
  const abs = Math.abs(value).toFixed(1).replace(".", ",");
  if (value > 0) return `+${abs} kg`;
  if (value < 0) return `-${abs} kg`;
  return "0,0 kg";
}

export function formatNumber(value: number | null | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
