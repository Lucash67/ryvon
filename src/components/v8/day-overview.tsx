"use client";

import { cn } from "@/utils/cn";

type DayMetric = { label: string; value: string };

export function DayOverview({
  days,
  activeDate,
  onSelect,
  className,
}: {
  days: Array<{ date: string; weekday: string; dayNum: string; metrics: DayMetric[]; active?: boolean }>;
  activeDate?: string;
  onSelect?: (date: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-[9px] sm:grid-cols-4 lg:grid-cols-7", className)}>
      {days.map((day) => {
        const active = activeDate ? day.date === activeDate : day.active;
        const Comp = onSelect ? "button" : "div";
        return (
          <Comp
            key={day.date}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(day.date) : undefined}
            className={cn(
              "rounded-[14px] border p-3 text-left transition-all",
              active
                ? "border-primary/45 bg-primary/10"
                : "border-border bg-surface-2 hover:border-primary/25",
            )}
          >
            <p className="text-[10px] font-extrabold tracking-[0.08em] text-muted uppercase">{day.weekday}</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">{day.dayNum}</p>
            <div className="mt-2 space-y-0.5">
              {day.metrics.map((m) => (
                <p key={m.label} className="text-[10px] leading-snug text-muted">
                  {m.label} {m.value}
                </p>
              ))}
            </div>
          </Comp>
        );
      })}
    </div>
  );
}

export function DayStrip({
  days,
  activeDate,
  onSelect,
  className,
}: {
  days: Array<{ date: string; weekday: string; dayNum: string }>;
  activeDate: string;
  onSelect?: (date: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-7", className)}>
      {days.map((day) => {
        const active = day.date === activeDate;
        const Comp = onSelect ? "button" : "div";
        return (
          <Comp
            key={day.date}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(day.date) : undefined}
            className={cn(
              "rounded-xl px-1.5 py-3 text-center transition-all",
              active ? "border border-primary/45 bg-primary/10" : "border border-transparent bg-surface-2",
            )}
          >
            <p className="text-[10px] font-bold text-muted uppercase">{day.weekday}</p>
            <p className="mt-1 text-sm font-black text-foreground">{day.dayNum}</p>
          </Comp>
        );
      })}
    </div>
  );
}
