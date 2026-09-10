import { cn } from "@/utils/cn";
import { clamp } from "@/utils/format";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-[9px] w-full overflow-hidden rounded-full bg-surface-3", className)}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${clamp(value, 0, 100)}%`,
          background: "var(--progress-fill)",
        }}
      />
    </div>
  );
}
