import { cn } from "@/utils/cn";

export function MetricCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "kpi-accent relative min-h-[128px] overflow-hidden rounded-[var(--radius-xl)] border border-border p-[17px] transition-all duration-200",
        className,
      )}
      style={{ background: "var(--card-gradient)", boxShadow: "var(--shadow)" }}
    >
      <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">{label}</p>
      <p className="mt-3 text-[26px] font-black tracking-tight text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-[11px] leading-snug text-muted">{sub}</p> : null}
    </div>
  );
}
