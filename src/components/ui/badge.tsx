import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-[#f2f4f8] text-muted",
        tone === "success" && "bg-[#e8f7f1] text-success",
        tone === "warning" && "bg-[#fff6e5] text-warning",
        tone === "danger" && "bg-[#fdecec] text-danger",
        tone === "primary" && "bg-[#eaf2fe] text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
