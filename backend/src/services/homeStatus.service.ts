import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export interface HomeStatus {
  weather: string;
  weatherIcon: string;
  listening: { active: boolean; label: string };
  voiceResult: string | null;
}

interface HomeStatusRow {
  id: number;
  weather: string;
  weather_icon: string;
  listening_active: boolean;
  listening_label: string;
  voice_result: string | null;
}

function toHomeStatus(row: HomeStatusRow): HomeStatus {
  return {
    weather: row.weather,
    weatherIcon: row.weather_icon,
    listening: { active: row.listening_active, label: row.listening_label },
    voiceResult: row.voice_result,
  };
}

export async function getHomeStatus(): Promise<HomeStatus> {
  const rows = await query<HomeStatusRow>("SELECT * FROM home_status WHERE id = 1");
  if (rows.length === 0) throw new HttpError(404, "Home status not found");
  return toHomeStatus(rows[0]);
}

export async function updateHomeStatus(data: Partial<HomeStatus>): Promise<HomeStatus> {
  const columnMap: Record<string, unknown> = {};
  if (data.weather !== undefined) columnMap.weather = data.weather;
  if (data.weatherIcon !== undefined) columnMap.weather_icon = data.weatherIcon;
  if (data.listening?.active !== undefined) columnMap.listening_active = data.listening.active;
  if (data.listening?.label !== undefined) columnMap.listening_label = data.listening.label;
  if (data.voiceResult !== undefined) columnMap.voice_result = data.voiceResult;

  const { setClause, values } = buildUpdateSet(columnMap);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<HomeStatusRow>(
    `UPDATE home_status SET ${setClause} WHERE id = 1 RETURNING *`,
    values
  );
  if (rows.length === 0) throw new HttpError(404, "Home status not found");
  return toHomeStatus(rows[0]);
}
