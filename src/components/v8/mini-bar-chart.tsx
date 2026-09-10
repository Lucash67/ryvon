"use client";

import { cn } from "@/utils/cn";

type BarPoint = { label: string; value: number; color?: string };

export function MiniBarChart({
  data,
  max,
  height = 190,
  className,
}: {
  data: BarPoint[];
  max?: number;
  height?: number;
  className?: string;
}) {
  const peak = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end justify-between gap-1.5", className)} style={{ height }}>
      {data.map((point) => {
        const pct = peak > 0 ? (point.value / peak) * 100 : 0;
        return (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex w-full max-w-[30px] flex-1 items-end justify-center">
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(pct, point.value > 0 ? 4 : 0)}%`,
                  background: point.color ?? "linear-gradient(180deg, var(--primary), var(--accent))",
                  minHeight: point.value > 0 ? 4 : 0,
                }}
              />
            </div>
            <span className="text-[10px] text-muted">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
