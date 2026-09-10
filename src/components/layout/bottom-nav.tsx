"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { maisRoutes, mobileNav } from "@/components/layout/nav-config";
import { cn } from "@/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] px-1 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid h-[74px] grid-cols-5">
        {mobileNav.map((item) => {
          const active =
            item.href === "/mais"
              ? maisRoutes.some((path) => pathname === path || pathname.startsWith(`${path}/`))
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} strokeWidth={active ? 2.25 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
