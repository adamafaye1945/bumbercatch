import { CloudOff } from "lucide-react";

export function DataUnavailable({ message = "Data unavailable" }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <CloudOff className="size-6" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
