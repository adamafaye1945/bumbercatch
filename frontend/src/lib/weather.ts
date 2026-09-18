import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Thermometer,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

// OpenWeather icon codes: a two-digit condition prefix + "d"/"n" day/night
// suffix (e.g. "01d", "10n"). See https://docs.openweather.co.uk/weather-conditions.
// Icons rather than emoji: Raspberry Pi OS often lacks a color-emoji font,
// so emoji render as blank boxes there -- SVG icons work identically everywhere.
const ICON_COMPONENT: Record<string, ComponentType<LucideProps>> = {
  "01d": Sun,
  "01n": Moon,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloud,
  "04n": Cloud,
  "09d": CloudDrizzle,
  "09n": CloudDrizzle,
  "10d": CloudRain,
  "10n": CloudRain,
  "11d": CloudLightning,
  "11n": CloudLightning,
  "13d": CloudSnow,
  "13n": CloudSnow,
  "50d": CloudFog,
  "50n": CloudFog,
};

export function weatherIcon(icon: string): ComponentType<LucideProps> {
  return ICON_COMPONENT[icon] ?? Thermometer;
}
