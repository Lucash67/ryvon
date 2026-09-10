"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandMark } from "@/components/layout/brand-mark";

export function AppTopbar() {
  return (
    <header className="no-print mb-5 flex items-center justify-between gap-3 lg:hidden">
      <BrandMark compact />
      <ThemeToggle />
    </header>
  );
}
