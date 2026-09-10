import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 py-8">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(12,108,255,.2), rgba(0,226,255,.12))",
          }}
        >
          <span className="text-lg text-accent">↗</span>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          {description ? <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p> : null}
        </div>
        {actionLabel && onAction ? (
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
