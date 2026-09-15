import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChecklistSource } from "@/data/checklist";

export function ChecklistItem({
  label,
  checked,
  source,
}: {
  label: string;
  checked: boolean;
  source?: ChecklistSource;
}) {
  return (
    <label className="flex items-center gap-3 py-2.5">
      <Checkbox checked={checked} disabled />
      <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>
        {label}
      </span>
      {source && (
        <Badge variant="outline" className="shrink-0">
          {source}
        </Badge>
      )}
    </label>
  );
}
