import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppShell() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <button
        type="button"
        aria-label="Refresh"
        disabled={refreshing}
        onClick={handleRefresh}
        className="fixed bottom-3 left-3 z-50 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
      </button>
      <button
        type="button"
        aria-label="Quit"
        onClick={() => window.electronAPI?.quit()}
        className="fixed right-3 top-3 z-50 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <div className="flex min-h-screen w-full flex-col px-4 py-6 sm:px-8 md:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  );
}
