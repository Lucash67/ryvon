import { saveLabel } from "@/hooks/use-auto-save";
import type { SaveState } from "@/types";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  saveState,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  saveState?: SaveState;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-semibold tracking-[0.16em] text-muted">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        {saveState && saveState !== "idle" ? (
          <p className={`mt-1 text-xs ${saveState === "error" ? "text-danger" : "text-muted"}`}>
            {saveLabel(saveState)}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
