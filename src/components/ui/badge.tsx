import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary" | "info";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold",
        tone === "neutral" && "border border-border bg-surface-2 text-muted",
        tone === "success" && "bg-success/12 text-[#72e3be]",
        tone === "warning" && "bg-warning/12 text-[#ffd37e]",
        tone === "danger" && "bg-danger/12 text-[#ff9ca5]",
        tone === "primary" && "bg-primary/12 text-primary-soft",
        tone === "info" && "bg-primary/12 text-[#8eb8ff]",
        className,
      )}
    >
      {children}
    </span>
  );
}
