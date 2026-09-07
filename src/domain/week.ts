import { addDays, differenceInCalendarDays } from "date-fns";
import { WORKOUT_CYCLE } from "@/domain/constants";
import { parseDate, toDateString, weekEnd, weekNumberForDate, weekStart } from "@/utils/dates";
import type { DayType, WorkoutTemplate } from "@/types";

export function buildWeekBounds(date: Date | string, programStart: string) {
  const start = weekStart(date);
  const end = weekEnd(date);
  return {
    weekNumber: weekNumberForDate(date, programStart),
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
}

export function cycleIndexForDate(date: string, cycleStartDate: string) {
  const index = differenceInCalendarDays(parseDate(date), parseDate(cycleStartDate));
  return ((index % 7) + 7) % 7;
}

export function plannedTemplateForDate(
  date: string,
  cycleStartDate: string,
  templates: WorkoutTemplate[],
) {
  const index = cycleIndexForDate(date, cycleStartDate);
  return templates.find((template) => template.order_index === index) ?? null;
}

export function dayTypeForTemplate(template: WorkoutTemplate | null): DayType {
  if (!template) return "off";
  return template.is_rest ? "off" : "on";
}

export function plannedTemplateMeta(date: string, cycleStartDate: string) {
  return WORKOUT_CYCLE[cycleIndexForDate(date, cycleStartDate)];
}

export function nextDates(from: string, count: number) {
  return Array.from({ length: count }, (_, index) => toDateString(addDays(parseDate(from), index)));
}
