import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full flex-col px-4 py-6 sm:px-8 md:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  );
}
