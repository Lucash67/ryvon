import { cn } from "@/utils/cn";

export function HeroSection({
  title,
  subtitle,
  children,
  aside,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border p-6 lg:p-[24px]",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--surface)) 0%, var(--surface) 48%, color-mix(in srgb, var(--accent) 6%, var(--surface)) 100%)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="grid gap-[22px] lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <h2 className="text-[29px] font-black tracking-[-0.04em] text-foreground">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">{subtitle}</p> : null}
          {children}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  );
}

export function WeekOrbit({ days }: { days: Array<{ label: string; active?: boolean; done?: boolean }> }) {
  return (
    <div className="grid grid-cols-7 gap-[7px]">
      {days.map((day) => (
        <div
          key={day.label}
          className={cn(
            "rounded-xl px-1 py-2.5 text-center text-[10px] font-bold uppercase",
            day.active
              ? "border border-primary/45 bg-primary/12 text-foreground"
              : day.done
                ? "bg-success/12 text-success"
                : "bg-surface-2 text-muted",
          )}
        >
          {day.label}
        </div>
      ))}
    </div>
  );
}
