import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppTopbar } from "@/components/layout/app-topbar";
import { QuickEntry } from "@/components/quick-entry/quick-entry";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-[13px] pb-[calc(74px+env(safe-area-inset-bottom)+20px)] pt-4 lg:px-8 lg:pb-10 lg:pt-6">
          <AppTopbar />
          {children}
        </main>
        <BottomNav />
        <QuickEntry />
      </div>
    </div>
  );
}
