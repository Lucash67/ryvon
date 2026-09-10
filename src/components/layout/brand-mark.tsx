import { cn } from "@/utils/cn";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
          style={{
            background: "linear-gradient(135deg, #0c6cff 0%, #00e2ff 100%)",
            boxShadow: "0 12px 30px rgba(12, 108, 255, 0.22)",
          }}
          aria-hidden
        >
          <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
            <path
              d="M8 24 L16 6 L24 24 L19 24 L16 16 L13 24 Z"
              fill="white"
              fillOpacity="0.95"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black tracking-[0.18em] text-foreground">RYVON</p>
          {!compact ? (
            <p className="mt-0.5 truncate text-[10px] tracking-[0.14em] text-muted uppercase">
              Evolução em movimento.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
