"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNav } from "@/components/layout/nav-config";
import { cn } from "@/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {mobileNav.map((item) => {
          const active =
            item.href === "/mais"
              ? ["/mais", "/nutricao", "/cardio", "/sono", "/fotos", "/relatorios", "/configuracoes"].some((path) =>
                  pathname.startsWith(path),
                )
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center text-xs font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
