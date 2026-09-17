import { ListChecks } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ChecklistItem } from "@/components/common/ChecklistItem";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useChecklist, useDeleteChecklistItem } from "@/hooks/queries";

export function Today() {
  const { data: checklistItems, isLoading, isError } = useChecklist();
  const deleteChecklistItem = useDeleteChecklistItem();

  return (
    <div>
      <PageHeader title="Today" icon={ListChecks} />
      {isLoading ? (
        <LoadingState />
      ) : isError || !checklistItems ? (
        <DataUnavailable />
      ) : (
        <div className="divide-y divide-border">
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.label}
              checked={item.checked}
              source={item.source}
              onDelete={() => deleteChecklistItem.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
