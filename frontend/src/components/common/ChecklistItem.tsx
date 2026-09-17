import { Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChecklistSource } from "@/types/api";

export function ChecklistItem({
  label,
  checked,
  source,
  onDelete,
}: {
  label: string;
  checked: boolean;
  source?: ChecklistSource;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <label className="flex flex-1 items-center gap-3">
        <Checkbox checked={checked} disabled />
        <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>
          {label}
        </span>
      </label>
      {source && (
        <Badge variant="outline" className="shrink-0">
          {source}
        </Badge>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete ${label}`}
          onClick={onDelete}
          className="shrink-0 text-foreground/70 transition-colors hover:text-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
