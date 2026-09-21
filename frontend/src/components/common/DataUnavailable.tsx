import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataUnavailable({ message = "Data unavailable" }: { message?: string }) {
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    await queryClient.invalidateQueries();
    setRetrying(false);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <CloudOff className="size-6" />
      <p className="text-sm">{message}</p>
      <Button variant="outline" size="sm" disabled={retrying} onClick={handleRetry}>
        <RefreshCw className={cn("size-4", retrying && "animate-spin")} />
        Retry
      </Button>
    </div>
  );
}
