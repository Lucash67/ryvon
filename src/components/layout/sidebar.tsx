"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav } from "@/components/layout/nav-config";
import { cn } from "@/utils/cn";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print hidden w-64 shrink-0 border-r border-border bg-white lg:flex lg:flex-col">
      <div className="px-6 py-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted">RYVON</p>
        <p className="mt-1 text-lg font-semibold">Painel operacional</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {desktopNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm font-medium",
                active ? "bg-[#eaf2fe] text-primary" : "text-muted hover:bg-[#f4f7fb] hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
