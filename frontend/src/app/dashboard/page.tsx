import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
