import { randomUUID } from "crypto";
import { query } from "../db";
import { HttpError } from "../utils/httpError";

export type ReminderSource = "manual" | "voice";

export interface Reminder {
  id: string;
  label: string;
  dueAt: string;
  dismissedAt: string | null;
  source: ReminderSource;
}

interface ReminderRow {
  id: string;
  label: string;
  due_at: string;
  dismissed_at: string | null;
  source: ReminderSource;
}

const COLUMNS = "id, label, due_at, dismissed_at, source";

function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    label: row.label,
    dueAt: row.due_at,
    dismissedAt: row.dismissed_at,
    source: row.source,
  };
}

export async function listReminders(): Promise<Reminder[]> {
  const rows = await query<ReminderRow>(`SELECT ${COLUMNS} FROM reminders ORDER BY due_at`);
  return rows.map(toReminder);
}

export async function getReminder(id: string): Promise<Reminder> {
  const rows = await query<ReminderRow>(`SELECT ${COLUMNS} FROM reminders WHERE id = $1`, [id]);
  if (rows.length === 0) throw new HttpError(404, `Reminder "${id}" not found`);
  return toReminder(rows[0]);
}

export async function createReminder(data: {
  label: string;
  dueAt: string;
  source?: ReminderSource;
}): Promise<Reminder> {
  const rows = await query<ReminderRow>(
    `INSERT INTO reminders (id, label, due_at, source) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [randomUUID(), data.label, data.dueAt, data.source ?? "manual"]
  );
  return toReminder(rows[0]);
}

export async function dismissReminder(id: string): Promise<Reminder> {
  const rows = await query<ReminderRow>(
    `UPDATE reminders SET dismissed_at = now() WHERE id = $1 RETURNING ${COLUMNS}`,
    [id]
  );
  if (rows.length === 0) throw new HttpError(404, `Reminder "${id}" not found`);
  return toReminder(rows[0]);
}

export async function snoozeReminder(id: string, minutes = 15): Promise<Reminder> {
  const rows = await query<ReminderRow>(
    `UPDATE reminders SET due_at = due_at + make_interval(mins => $2), dismissed_at = NULL
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, minutes]
  );
  if (rows.length === 0) throw new HttpError(404, `Reminder "${id}" not found`);
  return toReminder(rows[0]);
}

export async function deleteReminder(id: string): Promise<void> {
  const rows = await query("DELETE FROM reminders WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Reminder "${id}" not found`);
}
