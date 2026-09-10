import { cn } from "@/utils/cn";

export function MetricRow({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-[10px]", className)}>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        {hint ? <p className="text-[10px] text-muted">{hint}</p> : null}
      </div>
      <div className="shrink-0 text-right text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function MetricList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-[9px]", className)}>{children}</div>;
}
