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
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" && "bg-primary text-white hover:bg-[#1d6ade]",
        variant === "secondary" && "bg-[#eef4ff] text-primary hover:bg-[#e4eeff]",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-[#eef2f8]",
        variant === "outline" && "border border-border bg-white text-foreground hover:bg-[#f7f9fc]",
        variant === "danger" && "bg-danger text-white hover:bg-[#c83f3f]",
        className,
      )}
      {...props}
    />
  );
}
