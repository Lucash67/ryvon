import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function DomainEmptyState({
  domain,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  domain?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-2/50 px-6 py-12 text-center",
        className,
      )}
    >
      {domain ? (
        <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">{domain}</p>
      ) : null}
      <p className="mt-2 text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
