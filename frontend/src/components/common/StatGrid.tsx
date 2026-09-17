import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatGrid({
  columns,
  children,
  className,
}: {
  columns: 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-5",
        columns === 3 ? "grid-cols-3" : "grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}
