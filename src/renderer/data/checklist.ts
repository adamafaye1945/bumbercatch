export type ChecklistSource = "Calendar" | "Email" | "Reminder" | "Manual";

export interface ChecklistItemData {
  id: string;
  label: string;
  checked: boolean;
  source: ChecklistSource;
}

export const checklistItems: ChecklistItemData[] = [
  { id: "t1", label: "Standup at 10am", checked: true, source: "Calendar" },
  { id: "t2", label: "Reply to JPMC email", checked: true, source: "Email" },
  { id: "t3", label: "Gym session at 6pm", checked: false, source: "Reminder" },
  { id: "t4", label: "Call dad about rentals", checked: false, source: "Manual" },
];
