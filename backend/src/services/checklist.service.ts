import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export type ChecklistSource = "Calendar" | "Email" | "Reminder" | "Manual" | "Voice";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  source: ChecklistSource;
}

export function listChecklistItems(): Promise<ChecklistItem[]> {
  return query<ChecklistItem>("SELECT * FROM checklist_items ORDER BY id");
}

export async function getChecklistItem(id: string): Promise<ChecklistItem> {
  const rows = await query<ChecklistItem>("SELECT * FROM checklist_items WHERE id = $1", [id]);
  if (rows.length === 0) throw new HttpError(404, `Checklist item "${id}" not found`);
  return rows[0];
}

export async function createChecklistItem(data: ChecklistItem): Promise<ChecklistItem> {
  const rows = await query<ChecklistItem>(
    "INSERT INTO checklist_items (id, label, checked, source) VALUES ($1, $2, $3, $4) RETURNING *",
    [data.id, data.label, data.checked, data.source]
  );
  return rows[0];
}

export async function updateChecklistItem(
  id: string,
  data: Partial<Omit<ChecklistItem, "id">>
): Promise<ChecklistItem> {
  const { setClause, values } = buildUpdateSet(data);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<ChecklistItem>(
    `UPDATE checklist_items SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );
  if (rows.length === 0) throw new HttpError(404, `Checklist item "${id}" not found`);
  return rows[0];
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const rows = await query("DELETE FROM checklist_items WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Checklist item "${id}" not found`);
}
