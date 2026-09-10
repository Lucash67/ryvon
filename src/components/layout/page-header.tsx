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
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.11em] text-muted uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-[30px]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{subtitle}</p> : null}
        {saveState && saveState !== "idle" ? (
          <p
            className={`mt-2 text-[11px] ${
              saveState === "error" ? "text-danger" : saveState === "saved" ? "text-success" : "text-warning"
            }`}
          >
            {saveLabel(saveState)}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
