import { cn } from "@/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-[13px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" && "btn-primary-gradient text-white",
        variant === "secondary" && "border border-border bg-surface-2 text-foreground hover:-translate-y-px hover:border-primary/45",
        variant === "ghost" && "border border-dashed border-border bg-transparent text-muted hover:text-foreground",
        variant === "outline" && "border border-border bg-surface text-foreground hover:-translate-y-px hover:border-primary/45",
        variant === "danger" && "bg-danger text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
