import type { ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-dvw bg-background text-foreground font-[Fira_Code]">
      <div className="flex min-h-dvh w-full">
        <DashboardSidebar />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
