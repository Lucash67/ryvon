"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function RestTimer({
  seconds,
  onSkip,
  className,
}: {
  seconds: number;
  onSkip?: () => void;
  className?: string;
}) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-accent/35 bg-[color-mix(in_srgb,var(--surface-2)_94%,transparent)] px-5 py-4 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-muted uppercase">Descanso</p>
          <p className="font-mono text-3xl font-black tabular-nums text-accent">{label}</p>
        </div>
        {onSkip ? (
          <Button variant="secondary" size="sm" onClick={onSkip}>
            Pular
          </Button>
        ) : null}
      </div>
    </div>
  );
}
