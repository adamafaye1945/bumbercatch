import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export type EmailAccount = "Personal" | "Work";

export interface EmailItem {
  id: string;
  account: EmailAccount;
  sender: string;
  unread: boolean;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string | null;
}

interface EmailRow {
  id: string;
  account: EmailAccount;
  sender: string;
  unread: boolean;
  subject: string;
  preview: string;
  body: string;
  received_at: string | null;
}

const COLUMNS = "id, account, sender, unread, subject, preview, body, received_at";

function toEmailItem(row: EmailRow): EmailItem {
  return {
    id: row.id,
    account: row.account,
    sender: row.sender,
    unread: row.unread,
    subject: row.subject,
    preview: row.preview,
    body: row.body,
    receivedAt: row.received_at,
  };
}

export async function listEmails(): Promise<EmailItem[]> {
  const rows = await query<EmailRow>(
    `SELECT ${COLUMNS} FROM emails ORDER BY received_at DESC NULLS LAST`
  );
  return rows.map(toEmailItem);
}

export async function getEmail(id: string): Promise<EmailItem> {
  const rows = await query<EmailRow>(`SELECT ${COLUMNS} FROM emails WHERE id = $1`, [id]);
  if (rows.length === 0) throw new HttpError(404, `Email "${id}" not found`);
  return toEmailItem(rows[0]);
}

export async function createEmail(data: Omit<EmailItem, "receivedAt">): Promise<EmailItem> {
  const rows = await query<EmailRow>(
    `INSERT INTO emails (id, account, sender, unread, subject, preview, body)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNS}`,
    [data.id, data.account, data.sender, data.unread, data.subject, data.preview, data.body]
  );
  return toEmailItem(rows[0]);
}

export async function updateEmail(id: string, data: Partial<Omit<EmailItem, "id">>): Promise<EmailItem> {
  const columnMap: Record<string, unknown> = { ...data };
  if ("receivedAt" in columnMap) {
    columnMap.received_at = columnMap.receivedAt;
    delete columnMap.receivedAt;
  }

  const { setClause, values } = buildUpdateSet(columnMap);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<EmailRow>(
    `UPDATE emails SET ${setClause} WHERE id = $${values.length + 1} RETURNING ${COLUMNS}`,
    [...values, id]
  );
  if (rows.length === 0) throw new HttpError(404, `Email "${id}" not found`);
  return toEmailItem(rows[0]);
}

export async function deleteEmail(id: string): Promise<void> {
  const rows = await query("DELETE FROM emails WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Email "${id}" not found`);
}
