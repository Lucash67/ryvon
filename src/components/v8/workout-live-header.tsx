"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function WorkoutLiveHeader({
  label,
  timer,
  restLabel,
  onStartRest,
  onFinish,
  className,
}: {
  label: string;
  timer: string;
  restLabel?: string;
  onStartRest?: () => void;
  onFinish?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-2 z-30 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/35 bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] p-[13px_14px] backdrop-blur-xl",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">Treino ao vivo</p>
        <p className="truncate text-sm font-semibold text-foreground">{label}</p>
        <p className="font-mono text-[21px] font-black tabular-nums tracking-tight text-foreground">{timer}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {restLabel ? (
          <div className="rounded-[11px] border border-accent/35 bg-accent/8 px-[10px] py-2">
            <p className="text-[9px] font-medium tracking-wide text-muted uppercase">Descanso</p>
            <p className="font-mono text-base font-bold tabular-nums text-accent">{restLabel}</p>
          </div>
        ) : null}
        {onStartRest ? (
          <Button variant="secondary" size="sm" onClick={onStartRest}>
            Iniciar descanso
          </Button>
        ) : null}
        {onFinish ? (
          <Button size="sm" onClick={onFinish}>
            Finalizar treino
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function WorkoutStickyBar({
  label,
  timer,
  restLabel,
  onRest,
  onOpen,
  onFinish,
  className,
}: {
  label: string;
  timer: string;
  restLabel?: string;
  onRest?: () => void;
  onOpen?: () => void;
  onFinish?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(74px+env(safe-area-inset-bottom))] z-40 mx-auto w-[min(720px,calc(100vw-28px))] rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] p-[10px_12px] shadow-xl backdrop-blur-xl lg:bottom-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{label}</p>
          <p className="font-mono text-lg font-black tabular-nums">{timer}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {restLabel ? <span className="self-center text-xs text-accent">{restLabel}</span> : null}
          {onRest ? (
            <Button variant="secondary" size="sm" onClick={onRest}>
              Descanso
            </Button>
          ) : null}
          {onOpen ? (
            <Button variant="outline" size="sm" onClick={onOpen}>
              Abrir
            </Button>
          ) : null}
          {onFinish ? (
            <Button size="sm" onClick={onFinish}>
              Finalizar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
