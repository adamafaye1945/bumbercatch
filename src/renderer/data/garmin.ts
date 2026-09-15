export interface GarminStats {
  bodyBattery: { value: number; caption: string };
  steps: { value: number; goal: number };
  restingHr: { value: number; caption: string };
  sleep: { total: string; deepCaption: string };
  stress: { level: string; caption: string };
}

export const garminStats: GarminStats = {
  bodyBattery: { value: 48, caption: "Down from 62 this morning" },
  steps: { value: 6240, goal: 8000 },
  restingHr: { value: 62, caption: "Normal range" },
  sleep: { total: "7h 15m", deepCaption: "Deep: 1h 40m" },
  stress: { level: "Low", caption: "Avg today: 22" },
};
