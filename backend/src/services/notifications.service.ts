import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export interface NotificationItem {
  id: string;
  source: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  source: string;
  message: string;
  read: boolean;
  created_at: string;
}

const COLUMNS = "id, source, message, read, created_at";

function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    source: row.source,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const rows = await query<NotificationRow>(
    `SELECT ${COLUMNS} FROM notifications ORDER BY created_at DESC`
  );
  return rows.map(toNotificationItem);
}

export async function getNotification(id: string): Promise<NotificationItem> {
  const rows = await query<NotificationRow>(`SELECT ${COLUMNS} FROM notifications WHERE id = $1`, [id]);
  if (rows.length === 0) throw new HttpError(404, `Notification "${id}" not found`);
  return toNotificationItem(rows[0]);
}

export async function createNotification(
  data: Pick<NotificationItem, "id" | "source" | "message">
): Promise<NotificationItem> {
  const rows = await query<NotificationRow>(
    `INSERT INTO notifications (id, source, message) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [data.id, data.source, data.message]
  );
  return toNotificationItem(rows[0]);
}

// Used by the notification rules -- inserts once per deterministic id, silently
// skipping if that alert has already been raised (see backend/src/notifications/rules.ts).
export async function insertNotificationIfAbsent(
  data: Pick<NotificationItem, "id" | "source" | "message">
): Promise<void> {
  await query(
    `INSERT INTO notifications (id, source, message) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
    [data.id, data.source, data.message]
  );
}

export async function updateNotification(
  id: string,
  data: Partial<Omit<NotificationItem, "id" | "createdAt">>
): Promise<NotificationItem> {
  const { setClause, values } = buildUpdateSet(data);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<NotificationRow>(
    `UPDATE notifications SET ${setClause} WHERE id = $${values.length + 1} RETURNING ${COLUMNS}`,
    [...values, id]
  );
  if (rows.length === 0) throw new HttpError(404, `Notification "${id}" not found`);
  return toNotificationItem(rows[0]);
}

export async function markAllNotificationsRead(): Promise<void> {
  await query("UPDATE notifications SET read = TRUE WHERE read = FALSE");
}

export async function deleteNotification(id: string): Promise<void> {
  const rows = await query("DELETE FROM notifications WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Notification "${id}" not found`);
}
