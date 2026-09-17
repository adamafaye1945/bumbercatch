import * as fs from "fs";
import * as path from "path";
import { pool } from "./db";

export async function runMigrations(): Promise<void> {
  const sqlPath = path.join(__dirname, "../sql/init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}
