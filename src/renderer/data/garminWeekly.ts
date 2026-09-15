export interface WeekPoint {
  label: string;
  value: number;
  displayValue: string;
}

const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

function buildWeek(values: number[], format: (value: number) => string): WeekPoint[] {
  return days.map((label, i) => ({ label, value: values[i], displayValue: format(values[i]) }));
}

function formatSleep(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  return `${h}h${m}m`;
}

export const bodyBatteryWeek = buildWeek([55, 60, 58, 65, 52, 70, 48], (v) => `${v}`);
export const stepsWeek = buildWeek([8200, 6400, 9100, 7300, 5900, 8800, 6240], (v) => v.toLocaleString());
export const restingHrWeek = buildWeek([64, 66, 63, 65, 62, 64, 62], (v) => `${v}`);
export const sleepWeek = buildWeek([6.8, 7.5, 6.2, 7.9, 7.0, 8.1, 7.25], formatSleep);
export const stressWeek = buildWeek([28, 32, 24, 35, 20, 18, 22], (v) => `${v}`);
