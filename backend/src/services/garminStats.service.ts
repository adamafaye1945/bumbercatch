import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export interface GarminStats {
  bodyBattery: { value: number; caption: string };
  steps: { value: number; goal: number };
  restingHr: { value: number; caption: string };
  sleep: { total: string; deepCaption: string };
  stress: { level: string; caption: string };
}

interface GarminStatsRow {
  id: number;
  body_battery_value: number;
  body_battery_caption: string;
  steps_value: number;
  steps_goal: number;
  resting_hr_value: number;
  resting_hr_caption: string;
  sleep_total: string;
  sleep_deep_caption: string;
  stress_level: string;
  stress_caption: string;
}

function toGarminStats(row: GarminStatsRow): GarminStats {
  return {
    bodyBattery: { value: row.body_battery_value, caption: row.body_battery_caption },
    steps: { value: row.steps_value, goal: row.steps_goal },
    restingHr: { value: row.resting_hr_value, caption: row.resting_hr_caption },
    sleep: { total: row.sleep_total, deepCaption: row.sleep_deep_caption },
    stress: { level: row.stress_level, caption: row.stress_caption },
  };
}

export async function getGarminStats(): Promise<GarminStats> {
  const rows = await query<GarminStatsRow>("SELECT * FROM garmin_stats WHERE id = 1");
  if (rows.length === 0) throw new HttpError(404, "Garmin stats not found");
  return toGarminStats(rows[0]);
}

export async function updateGarminStats(data: Partial<GarminStats>): Promise<GarminStats> {
  const columnMap: Record<string, unknown> = {};
  if (data.bodyBattery?.value !== undefined) columnMap.body_battery_value = data.bodyBattery.value;
  if (data.bodyBattery?.caption !== undefined) columnMap.body_battery_caption = data.bodyBattery.caption;
  if (data.steps?.value !== undefined) columnMap.steps_value = data.steps.value;
  if (data.steps?.goal !== undefined) columnMap.steps_goal = data.steps.goal;
  if (data.restingHr?.value !== undefined) columnMap.resting_hr_value = data.restingHr.value;
  if (data.restingHr?.caption !== undefined) columnMap.resting_hr_caption = data.restingHr.caption;
  if (data.sleep?.total !== undefined) columnMap.sleep_total = data.sleep.total;
  if (data.sleep?.deepCaption !== undefined) columnMap.sleep_deep_caption = data.sleep.deepCaption;
  if (data.stress?.level !== undefined) columnMap.stress_level = data.stress.level;
  if (data.stress?.caption !== undefined) columnMap.stress_caption = data.stress.caption;

  const { setClause, values } = buildUpdateSet(columnMap);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<GarminStatsRow>(
    `UPDATE garmin_stats SET ${setClause} WHERE id = 1 RETURNING *`,
    values
  );
  if (rows.length === 0) throw new HttpError(404, "Garmin stats not found");
  return toGarminStats(rows[0]);
}
