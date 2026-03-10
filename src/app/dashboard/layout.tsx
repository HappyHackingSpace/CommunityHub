import { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />
      {/* 
        The main container is centered, with max-width imitating a clean feed aesthetic.
        Padding is provided for breathing room.
      */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
