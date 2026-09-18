// OpenWeather icon codes: a two-digit condition prefix + "d"/"n" day/night
// suffix (e.g. "01d", "10n"). See https://docs.openweather.co.uk/weather-conditions.
const ICON_EMOJI: Record<string, string> = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "🌤️",
  "02n": "☁️",
  "03d": "⛅",
  "03n": "⛅",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌦️",
  "09n": "🌦️",
  "10d": "🌧️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

export function iconToEmoji(icon: string): string {
  return ICON_EMOJI[icon] ?? "🌡️";
}
