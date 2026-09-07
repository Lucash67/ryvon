import { cn } from "@/utils/cn";
import { clamp } from "@/utils/format";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[#eef2f8]", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamp(value, 0, 100)}%` }}
      />
    </div>
  );
}
