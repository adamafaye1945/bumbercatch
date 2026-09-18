import { query } from "../db";
import { HttpError } from "../utils/httpError";

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

interface WeatherDailyRow {
  date: string;
  temp_min: string;
  temp_max: string;
  description: string;
  icon: string;
}

function toWeatherDay(row: WeatherDailyRow): WeatherDay {
  return {
    date: row.date,
    tempMin: Number(row.temp_min),
    tempMax: Number(row.temp_max),
    description: row.description,
    icon: row.icon,
  };
}

export async function getWeatherForecast(): Promise<WeatherDay[]> {
  const rows = await query<WeatherDailyRow>(
    "SELECT date::text, temp_min, temp_max, description, icon FROM weather_daily ORDER BY date"
  );
  if (rows.length === 0) throw new HttpError(404, "Weather not synced yet");
  return rows.map(toWeatherDay);
}

interface OpenWeatherResponse {
  timezone_offset: number;
  current: {
    temp: number;
    weather: [{ description: string; icon: string }];
  };
  daily: Array<{
    dt: number;
    temp: { min: number; max: number };
    weather: [{ description: string; icon: string }];
  }>;
}

// Runs inside the Electron main process (backend/src/main.ts), alongside the
// Garmin/iCloud syncs -- a plain authenticated REST call, no Python needed.
export async function syncWeather(): Promise<void> {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const lat = process.env.WEATHER_LAT;
  const lon = process.env.WEATHER_LON;

  if (!apiKey || !lat || !lon) {
    console.warn(
      "[weather] Skipping sync -- OPEN_WEATHER_API_KEY/WEATHER_LAT/WEATHER_LON not set in backend/.env."
    );
    return;
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=minutely,hourly,alerts`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const hint = res.status === 401 ? " (a fresh key may need a separate, still-free 'subscribe' step on openweathermap.org for One Call API 3.0)" : "";
    throw new Error(`OpenWeather request failed: ${res.status} ${res.statusText}${hint} -- ${body}`);
  }

  const data = (await res.json()) as OpenWeatherResponse;

  await query("UPDATE home_status SET weather = $1, weather_icon = $2 WHERE id = 1", [
    `${Math.round(data.current.temp)}°F, ${data.current.weather[0].description}`,
    data.current.weather[0].icon,
  ]);

  for (const day of data.daily.slice(0, 5)) {
    // Shift by the location's UTC offset before reading date components --
    // dt is a UTC timestamp, and reading it directly can land on the wrong
    // calendar day depending on the local offset (the same class of bug
    // fixed for voice reminders earlier this session).
    const localDate = new Date((day.dt + data.timezone_offset) * 1000);
    const date = localDate.toISOString().slice(0, 10);

    await query(
      `INSERT INTO weather_daily (date, temp_min, temp_max, description, icon)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (date) DO UPDATE SET
         temp_min = EXCLUDED.temp_min,
         temp_max = EXCLUDED.temp_max,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon`,
      [date, day.temp.min, day.temp.max, day.weather[0].description, day.weather[0].icon]
    );
  }
}
