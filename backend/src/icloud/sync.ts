import { ImapFlow, type FetchMessageObject } from "imapflow";
import { simpleParser } from "mailparser";
import { convert as htmlToText } from "html-to-text";
import { query } from "../db";

const IMAP_HOST = "imap.mail.me.com";
const IMAP_PORT = 993;
const FETCH_COUNT = 25;
const PREVIEW_LENGTH = 150;

export interface NewEmail {
  id: string;
  sender: string;
  subject: string;
}

export interface SyncResult {
  synced: number;
  newMessages: NewEmail[];
}

function resolveSender(envelope: FetchMessageObject["envelope"]): string {
  const from = envelope?.from?.[0];
  return from?.name || from?.address || "(unknown sender)";
}

function resolveBody(text: string | undefined, html: string | false | undefined): string {
  if (text) return text;
  if (html) return htmlToText(html);
  return "";
}

export async function syncICloudEmails(): Promise<SyncResult> {
  const user = process.env.ICLOUD_EMAIL;
  const pass = process.env.ICLOUD_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("ICLOUD_EMAIL / ICLOUD_APP_PASSWORD are not set (expected in backend/.env)");
  }

  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  await client.connect();
  let synced = 0;
  const newMessages: NewEmail[] = [];

  try {
    const mailbox = await client.mailboxOpen("INBOX");
    if (mailbox.exists === 0) {
      return { synced: 0, newMessages: [] };
    }
    const start = Math.max(1, mailbox.exists - FETCH_COUNT + 1);

    for await (const message of client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      envelope: true,
      source: true,
    })) {
      const id = message.envelope?.messageId || `icloud-uid-${message.uid}`;
      const parsed = message.source ? await simpleParser(message.source) : null;

      const sender = resolveSender(message.envelope);
      const subject = message.envelope?.subject || "(no subject)";
      const body = resolveBody(parsed?.text, parsed?.html);
      const preview = body.slice(0, PREVIEW_LENGTH);
      const unread = !message.flags?.has("\\Seen");
      const receivedAt = message.envelope?.date ?? null;

      const rows = await query<{ inserted: boolean }>(
        `INSERT INTO emails (id, account, sender, unread, subject, preview, body, received_at)
         VALUES ($1, 'Personal', $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           sender = EXCLUDED.sender,
           unread = EXCLUDED.unread,
           subject = EXCLUDED.subject,
           preview = EXCLUDED.preview,
           body = EXCLUDED.body,
           received_at = EXCLUDED.received_at
         RETURNING (xmax = 0) AS inserted`,
        [id, sender, unread, subject, preview, body, receivedAt]
      );
      synced++;
      if (rows[0]?.inserted) {
        newMessages.push({ id, sender, subject });
      }
    }
  } finally {
    await client.logout();
  }

  return { synced, newMessages };
}
