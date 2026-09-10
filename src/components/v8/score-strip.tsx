import { cn } from "@/utils/cn";

type ScoreItem = { label: string; value: string | number };

export function ScoreStrip({ items, className }: { items: ScoreItem[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-[9px] sm:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[14px] border border-border bg-surface-2 px-[10px] py-[14px] text-center"
        >
          <p className="text-[10px] font-medium tracking-[0.08em] text-muted uppercase">{item.label}</p>
          <strong className="mt-1 block text-[23px] font-black tracking-tight text-foreground">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
