import { query } from "../db";
import { HttpError } from "../utils/httpError";

export interface R6PlayerStats {
  gamertag: string;
  platform: string;
  rankName: string | null;
  rankPoints: number | null;
  kills: number | null;
  deaths: number | null;
  kdRatio: number | null;
  wins: number | null;
  losses: number | null;
}

interface R6Row {
  gamertag: string;
  platform: string;
  rank_name: string | null;
  rank_points: number | null;
  kills: number | null;
  deaths: number | null;
  kd_ratio: string | null;
  wins: number | null;
  losses: number | null;
}

function toR6PlayerStats(row: R6Row): R6PlayerStats {
  return {
    gamertag: row.gamertag,
    platform: row.platform,
    rankName: row.rank_name,
    rankPoints: row.rank_points,
    kills: row.kills,
    deaths: row.deaths,
    kdRatio: row.kd_ratio === null ? null : Number(row.kd_ratio),
    wins: row.wins,
    losses: row.losses,
  };
}

export async function getLeaderboard(): Promise<R6PlayerStats[]> {
  const rows = await query<R6Row>(
    `SELECT p.gamertag, p.platform, s.rank_name, s.rank_points, s.kills, s.deaths, s.kd_ratio, s.wins, s.losses
     FROM r6_players p
     LEFT JOIN r6_stats s ON s.gamertag = p.gamertag
     ORDER BY s.rank_points DESC NULLS LAST, p.gamertag ASC`
  );
  if (rows.length === 0) throw new HttpError(404, "No R6 players tracked yet");
  return rows.map(toR6PlayerStats);
}

// R6_PLAYERS in backend/.env is the source of truth for the roster -- add
// what's newly listed, remove what's no longer there. Skips (doesn't wipe
// anything) if the env var is unset/empty, same caution used elsewhere in
// this app for missing config.
async function reconcilePlayers(): Promise<string[]> {
  const platform = process.env.R6_PLATFORM || "uplay";
  const gamertags = (process.env.R6_PLAYERS || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  if (gamertags.length === 0) {
    console.warn("[r6] R6_PLAYERS is empty -- skipping roster reconciliation.");
    return [];
  }

  for (const gamertag of gamertags) {
    await query(
      `INSERT INTO r6_players (gamertag, platform) VALUES ($1, $2)
       ON CONFLICT (gamertag) DO UPDATE SET platform = EXCLUDED.platform`,
      [gamertag, platform]
    );
  }

  const placeholders = gamertags.map((_, i) => `$${i + 1}`).join(", ");
  await query(`DELETE FROM r6_players WHERE gamertag NOT IN (${placeholders})`, gamertags);

  return gamertags;
}

// The v1 stats endpoints (seasonalStats/stats) were removed by the provider
// mid-implementation and replaced with this single v2 endpoint, which -- per
// a live test against the real API -- returns rank AND kills/deaths/wins/
// losses together. One call per player, not two.
const FULLSTATS_URL = "https://public-api.arenyze.com/r6/api/v2/fullstats";

interface R6Profile {
  rank?: number;
  rank_points?: number;
  kills?: number;
  deaths?: number;
  wins?: number;
  losses?: number;
}

interface FullStatsResponse {
  fullStats?: {
    platform_families_full_profiles?: Array<{
      board_ids_full_profiles?: Array<{
        board_id?: string;
        full_profiles?: Array<{ profile?: R6Profile }>;
      }>;
    }>;
  };
}

// Sourced live from GET /r6/api/ranks?version=v7 (the current ranking system
// as of season 43 / Y11S3) -- maps rank points to the tier name shown in-game,
// far more reliable than guessing what the opaque numeric `rank` field means.
const RANK_TIERS: Array<{ name: string; minMmr: number }> = [
  { name: "Unranked", minMmr: 0 },
  { name: "Copper 5", minMmr: 1000 },
  { name: "Copper 4", minMmr: 1100 },
  { name: "Copper 3", minMmr: 1200 },
  { name: "Copper 2", minMmr: 1300 },
  { name: "Copper 1", minMmr: 1400 },
  { name: "Bronze 5", minMmr: 1500 },
  { name: "Bronze 4", minMmr: 1600 },
  { name: "Bronze 3", minMmr: 1700 },
  { name: "Bronze 2", minMmr: 1800 },
  { name: "Bronze 1", minMmr: 1900 },
  { name: "Silver 5", minMmr: 2000 },
  { name: "Silver 4", minMmr: 2100 },
  { name: "Silver 3", minMmr: 2200 },
  { name: "Silver 2", minMmr: 2300 },
  { name: "Silver 1", minMmr: 2400 },
  { name: "Gold 5", minMmr: 2500 },
  { name: "Gold 4", minMmr: 2600 },
  { name: "Gold 3", minMmr: 2700 },
  { name: "Gold 2", minMmr: 2800 },
  { name: "Gold 1", minMmr: 2900 },
  { name: "Platinum 5", minMmr: 3000 },
  { name: "Platinum 4", minMmr: 3100 },
  { name: "Platinum 3", minMmr: 3200 },
  { name: "Platinum 2", minMmr: 3300 },
  { name: "Platinum 1", minMmr: 3400 },
  { name: "Emerald 5", minMmr: 3500 },
  { name: "Emerald 4", minMmr: 3600 },
  { name: "Emerald 3", minMmr: 3700 },
  { name: "Emerald 2", minMmr: 3800 },
  { name: "Emerald 1", minMmr: 3900 },
  { name: "Diamond 5", minMmr: 4000 },
  { name: "Diamond 4", minMmr: 4100 },
  { name: "Diamond 3", minMmr: 4200 },
  { name: "Diamond 2", minMmr: 4300 },
  { name: "Diamond 1", minMmr: 4400 },
  { name: "Champion 5", minMmr: 4500 },
  { name: "Champion 4", minMmr: 4600 },
  { name: "Champion 3", minMmr: 4700 },
  { name: "Champion 2", minMmr: 4800 },
  { name: "Champion 1", minMmr: 4900 },
  { name: "Legend Division", minMmr: 5000 },
];

function deriveRankName(rankPoints: number | null): string | null {
  if (rankPoints === null) return null;
  let name = RANK_TIERS[0].name;
  for (const tier of RANK_TIERS) {
    if (rankPoints >= tier.minMmr) name = tier.name;
    else break;
  }
  return name;
}

function extractRankedProfile(data: FullStatsResponse): R6Profile | null {
  const boards = data.fullStats?.platform_families_full_profiles?.[0]?.board_ids_full_profiles ?? [];
  const ranked = boards.find((b) => b.board_id === "ranked");
  return ranked?.full_profiles?.[0]?.profile ?? null;
}

async function fetchFullStats(apiKey: string, gamertag: string, platform: string): Promise<FullStatsResponse> {
  const url = `${FULLSTATS_URL}?nameOnPlatform=${encodeURIComponent(gamertag)}&platformType=${platform}`;
  const res = await fetch(url, { headers: { "api-key": apiKey } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`r6data fullstats request for "${gamertag}" failed: ${res.status} ${res.statusText} -- ${body}`);
  }
  return res.json() as Promise<FullStatsResponse>;
}

// Runs on its own once-daily interval (backend/src/main.ts) -- the free tier
// is 2,000 calls/month and this needs 1 call per player per sync, so even a
// couple dozen players stays comfortably under budget on a daily cadence.
export async function syncR6Stats(): Promise<void> {
  const apiKey = process.env.R6_API_KEY;
  if (!apiKey) {
    console.warn("[r6] Skipping sync -- R6_API_KEY not set in backend/.env.");
    return;
  }

  const gamertags = await reconcilePlayers();
  const platform = process.env.R6_PLATFORM || "uplay";

  for (const gamertag of gamertags) {
    try {
      const data = await fetchFullStats(apiKey, gamertag, platform);
      const profile = extractRankedProfile(data);

      if (!profile) {
        console.warn(`[r6] Unexpected response shape for "${gamertag}" -- raw: ${JSON.stringify(data).slice(0, 2000)}`);
      }

      const rankPoints = profile?.rank_points ?? null;
      const kills = profile?.kills ?? null;
      const deaths = profile?.deaths ?? null;
      const kdRatio = kills !== null && deaths ? Number((kills / deaths).toFixed(3)) : null;
      const wins = profile?.wins ?? null;
      const losses = profile?.losses ?? null;
      const rankName = deriveRankName(rankPoints);

      await query(
        `INSERT INTO r6_stats (gamertag, rank_name, rank_points, kills, deaths, kd_ratio, wins, losses, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (gamertag) DO UPDATE SET
           rank_name = EXCLUDED.rank_name,
           rank_points = EXCLUDED.rank_points,
           kills = EXCLUDED.kills,
           deaths = EXCLUDED.deaths,
           kd_ratio = EXCLUDED.kd_ratio,
           wins = EXCLUDED.wins,
           losses = EXCLUDED.losses,
           synced_at = EXCLUDED.synced_at`,
        [gamertag, rankName, rankPoints, kills, deaths, kdRatio, wins, losses]
      );
    } catch (err) {
      console.warn(`[r6] Sync failed for "${gamertag}":`, err instanceof Error ? err.message : err);
    }
  }
}
