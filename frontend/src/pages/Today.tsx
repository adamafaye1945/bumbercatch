import { ListChecks } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ChecklistItem } from "@/components/common/ChecklistItem";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useChecklist, useDeleteChecklistItem, useOnCheck } from "@/hooks/queries";

export function Today() {
  const { data: checklistItems, isLoading, isError } = useChecklist();
  const deleteChecklistItem = useDeleteChecklistItem();
  const updateChecklistItem = useOnCheck();

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
              onCheck={() => updateChecklistItem.mutate({ id: item.id, checked: !item.checked })}
              onDelete={() => deleteChecklistItem.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
