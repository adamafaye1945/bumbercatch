import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Spinner className="size-6" />
      <p className="text-sm">Loading…</p>
    </div>
  );
}
