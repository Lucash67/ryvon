import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export function StatusTile({
  label,
  status,
  statusLabel,
  tone,
  className,
}: {
  label: string;
  status?: string;
  statusLabel: string;
  tone: "success" | "warning" | "danger" | "neutral" | "primary";
  className?: string;
}) {
  return (
    <div className={cn("rounded-[14px] border border-border bg-surface-2 p-[13px]", className)}>
      <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">{label}</p>
      <div className="mt-2">
        <Badge tone={tone}>{statusLabel}</Badge>
      </div>
      {status ? <p className="mt-2 text-[10px] text-muted">{status}</p> : null}
    </div>
  );
}
