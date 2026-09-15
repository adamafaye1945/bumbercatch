import { ListChecks } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ChecklistItem } from "@/components/common/ChecklistItem";
import { checklistItems } from "@/data/checklist";

export function Today() {
  return (
    <div>
      <PageHeader title="Today" icon={ListChecks} />
      <div className="divide-y divide-border">
        {checklistItems.map((item) => (
          <ChecklistItem key={item.id} label={item.label} checked={item.checked} source={item.source} />
        ))}
      </div>
    </div>
  );
}
