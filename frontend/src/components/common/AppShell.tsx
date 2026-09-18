import { Outlet } from "react-router-dom";
import { X } from "lucide-react";

import { PullToRefresh } from "@/components/common/PullToRefresh";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <button
        type="button"
        aria-label="Quit"
        onClick={() => window.electronAPI?.quit()}
        className="fixed right-3 top-3 z-50 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <PullToRefresh>
        <div className="flex min-h-screen w-full flex-col px-4 py-6 sm:px-8 md:px-12 lg:px-20">
          <Outlet />
        </div>
      </PullToRefresh>
    </div>
  );
}
