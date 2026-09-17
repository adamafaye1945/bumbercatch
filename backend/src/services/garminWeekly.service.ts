import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export type GarminMetric = "bodyBattery" | "steps" | "restingHr" | "sleep" | "stress";

export interface GarminWeeklyPoint {
  id: number;
  metric: GarminMetric;
  date: string;
  value: number;
}

interface GarminWeeklyRow {
  id: number;
  metric: GarminMetric;
  date: string;
  value: string;
}

function toGarminWeeklyPoint(row: GarminWeeklyRow): GarminWeeklyPoint {
  return {
    id: row.id,
    metric: row.metric,
    date: row.date,
    value: Number(row.value),
  };
}

export async function listGarminWeeklyStats(metric?: GarminMetric): Promise<GarminWeeklyPoint[]> {
  const rows = metric
    ? await query<GarminWeeklyRow>(
        `SELECT id, metric, date::text, value FROM (
           SELECT * FROM garmin_weekly_stats WHERE metric = $1 ORDER BY date DESC LIMIT 7
         ) recent ORDER BY date ASC`,
        [metric]
      )
    : await query<GarminWeeklyRow>(
        "SELECT id, metric, date::text, value FROM garmin_weekly_stats ORDER BY metric, date"
      );
  return rows.map(toGarminWeeklyPoint);
}

export async function getGarminWeeklyStat(id: number): Promise<GarminWeeklyPoint> {
  const rows = await query<GarminWeeklyRow>(
    "SELECT id, metric, date::text, value FROM garmin_weekly_stats WHERE id = $1",
    [id]
  );
  if (rows.length === 0) throw new HttpError(404, `Garmin weekly stat "${id}" not found`);
  return toGarminWeeklyPoint(rows[0]);
}

export async function createGarminWeeklyStat(
  data: Omit<GarminWeeklyPoint, "id">
): Promise<GarminWeeklyPoint> {
  const rows = await query<GarminWeeklyRow>(
    `INSERT INTO garmin_weekly_stats (metric, date, value)
     VALUES ($1, $2, $3) RETURNING id, metric, date::text, value`,
    [data.metric, data.date, data.value]
  );
  return toGarminWeeklyPoint(rows[0]);
}

export async function updateGarminWeeklyStat(
  id: number,
  data: Partial<Omit<GarminWeeklyPoint, "id">>
): Promise<GarminWeeklyPoint> {
  const columnMap: Record<string, unknown> = {};
  if (data.metric !== undefined) columnMap.metric = data.metric;
  if (data.date !== undefined) columnMap.date = data.date;
  if (data.value !== undefined) columnMap.value = data.value;

  const { setClause, values } = buildUpdateSet(columnMap);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<GarminWeeklyRow>(
    `UPDATE garmin_weekly_stats SET ${setClause} WHERE id = $${values.length + 1} RETURNING id, metric, date::text, value`,
    [...values, id]
  );
  if (rows.length === 0) throw new HttpError(404, `Garmin weekly stat "${id}" not found`);
  return toGarminWeeklyPoint(rows[0]);
}

export async function deleteGarminWeeklyStat(id: number): Promise<void> {
  const rows = await query("DELETE FROM garmin_weekly_stats WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Garmin weekly stat "${id}" not found`);
}
