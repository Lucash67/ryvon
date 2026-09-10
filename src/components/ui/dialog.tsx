"use client";

import { cn } from "@/utils/cn";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-[18px]">
      <button
        className="absolute inset-0 backdrop-blur-[9px]"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-label="Fechar"
      />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[20px] border border-border p-5",
          className,
        )}
        style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
