"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav } from "@/components/layout/nav-config";
import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/utils/cn";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print sticky top-0 hidden h-screen w-[274px] shrink-0 flex-col border-r border-border bg-[color-mix(in_srgb,var(--bg)_87%,transparent)] backdrop-blur-2xl lg:flex">
      <div className="flex flex-col gap-[18px] p-4 pt-[22px]">
        <div className="border-b border-border px-2 pb-[18px]">
          <BrandMark />
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-1">
          {desktopNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[13px] px-3 py-[11px] text-sm font-medium transition-all duration-200",
                  active
                    ? "translate-x-0.5 text-foreground"
                    : "text-muted hover:translate-x-0.5 hover:text-foreground",
                )}
                style={active ? { background: "var(--nav-active)" } : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
                {item.meta ? (
                  <span className="ml-auto rounded-full bg-primary/12 px-2 py-0.5 text-[10px] text-primary-soft">
                    {item.meta}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div
          className="mt-auto rounded-[17px] border border-border p-[15px]"
          style={{
            background: "linear-gradient(180deg, rgba(12,108,255,.08), rgba(0,226,255,.025))",
          }}
        >
          <strong className="block text-sm font-semibold text-foreground">Disciplina hoje.</strong>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Resultados sempre. Seu painel operacional de evolução física.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <ThemeToggle />
            <span className="text-[10px] tracking-wide text-muted uppercase">Tema</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
