import { query } from "../db";
import { buildUpdateSet } from "../utils/buildUpdateSet";
import { HttpError } from "../utils/httpError";

export interface FavoritePlace {
  id: string;
  name: string;
  etaMinutes: number;
  distanceMiles: number;
  traffic: string;
}

interface FavoritePlaceRow {
  id: string;
  name: string;
  eta_minutes: number;
  distance_miles: string;
  traffic: string;
}

function toFavoritePlace(row: FavoritePlaceRow): FavoritePlace {
  return {
    id: row.id,
    name: row.name,
    etaMinutes: row.eta_minutes,
    distanceMiles: Number(row.distance_miles),
    traffic: row.traffic,
  };
}

export async function listFavoritePlaces(): Promise<FavoritePlace[]> {
  const rows = await query<FavoritePlaceRow>("SELECT * FROM favorite_places ORDER BY id");
  return rows.map(toFavoritePlace);
}

export async function getFavoritePlace(id: string): Promise<FavoritePlace> {
  const rows = await query<FavoritePlaceRow>("SELECT * FROM favorite_places WHERE id = $1", [id]);
  if (rows.length === 0) throw new HttpError(404, `Favorite place "${id}" not found`);
  return toFavoritePlace(rows[0]);
}

export async function createFavoritePlace(data: FavoritePlace): Promise<FavoritePlace> {
  const rows = await query<FavoritePlaceRow>(
    `INSERT INTO favorite_places (id, name, eta_minutes, distance_miles, traffic)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.id, data.name, data.etaMinutes, data.distanceMiles, data.traffic]
  );
  return toFavoritePlace(rows[0]);
}

export async function updateFavoritePlace(
  id: string,
  data: Partial<Omit<FavoritePlace, "id">>
): Promise<FavoritePlace> {
  const columnMap: Record<string, unknown> = {};
  if (data.name !== undefined) columnMap.name = data.name;
  if (data.etaMinutes !== undefined) columnMap.eta_minutes = data.etaMinutes;
  if (data.distanceMiles !== undefined) columnMap.distance_miles = data.distanceMiles;
  if (data.traffic !== undefined) columnMap.traffic = data.traffic;

  const { setClause, values } = buildUpdateSet(columnMap);
  if (!setClause) throw new HttpError(400, "No fields to update");

  const rows = await query<FavoritePlaceRow>(
    `UPDATE favorite_places SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );
  if (rows.length === 0) throw new HttpError(404, `Favorite place "${id}" not found`);
  return toFavoritePlace(rows[0]);
}

export async function deleteFavoritePlace(id: string): Promise<void> {
  const rows = await query("DELETE FROM favorite_places WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) throw new HttpError(404, `Favorite place "${id}" not found`);
}
