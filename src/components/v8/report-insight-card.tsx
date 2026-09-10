import { cn } from "@/utils/cn";

export function ReportInsightCard({
  title,
  body,
  icon,
  className,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-border p-[18px]",
        className,
      )}
      style={{ background: "var(--card-gradient)" }}
    >
      <div className="flex gap-3">
        {icon ? (
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function ConclusionPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface-2 px-3 py-[11px] text-[11px] leading-relaxed text-muted", className)}>
      {children}
    </div>
  );
}

export function ReportReading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[13px] leading-[1.65] text-muted", className)}>{children}</p>
  );
}
