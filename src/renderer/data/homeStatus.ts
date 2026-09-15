export interface HomeStatus {
  time: string;
  date: string;
  weather: string;
  listening: { active: boolean; label: string };
  leaveBanner: { message: string; actionLabel: string };
}

export const homeStatus: HomeStatus = {
  time: "7:42 AM",
  date: "Monday, Sept 14",
  weather: "68°F, clear",
  listening: { active: true, label: "Listening" },
  leaveBanner: { message: "Leave by 6:00 PM for the gym", actionLabel: "Snooze" },
};
