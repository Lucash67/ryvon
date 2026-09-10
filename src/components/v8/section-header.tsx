import { cn } from "@/utils/cn";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-[11px] mt-[26px] flex items-end justify-between gap-3 first:mt-4", className)}>
      <div>
        <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
