/**
 * Manual/standalone sync runner -- lets you exercise syncICloudEmails()
 * without booting all of Electron. Not part of the `npm start` chain; the
 * real sync runs in-process from main.ts on every app launch.
 *
 * Usage: npm run email:sync
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { syncICloudEmails } from "../icloud/sync";
import { runNotificationRules } from "../notifications/rules";
import { pool } from "../db";

async function main(): Promise<void> {
  const { synced, newMessages } = await syncICloudEmails();
  console.log(`[icloud-sync] Synced ${synced} message(s), ${newMessages.length} new.`);
  await runNotificationRules(newMessages);
  await pool.end();
}

main().catch((err) => {
  console.error("[icloud-sync] Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
