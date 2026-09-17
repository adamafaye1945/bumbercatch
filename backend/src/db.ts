import { Pool, type QueryResultRow } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

// The SQL executor: every service goes through this single function to talk
// to Postgres, so query logging/retries/tracing only ever need to change here.
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
