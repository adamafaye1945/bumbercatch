export type ChecklistSource = "Calendar" | "Email" | "Reminder" | "Manual" | "Voice";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  source: ChecklistSource;
}

export type EmailAccount = "Personal" | "Work";

export interface EmailItem {
  id: string;
  account: EmailAccount;
  sender: string;
  unread: boolean;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string | null;
}

export interface NotificationItem {
  id: string;
  source: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FavoritePlace {
  id: string;
  name: string;
  etaMinutes: number;
  distanceMiles: number;
  traffic: string;
}

export interface HomeStatus {
  weather: string;
  listening: { active: boolean; label: string };
  voiceResult: string | null;
}

export type ReminderSource = "manual" | "voice";

export interface Reminder {
  id: string;
  label: string;
  dueAt: string;
  dismissedAt: string | null;
  source: ReminderSource;
}

export interface GarminStats {
  bodyBattery: { value: number; caption: string };
  steps: { value: number; goal: number };
  restingHr: { value: number; caption: string };
  sleep: { total: string; deepCaption: string };
  stress: { level: string; caption: string };
}

export type GarminMetric = "bodyBattery" | "steps" | "restingHr" | "sleep" | "stress";

export interface GarminWeeklyPoint {
  id: number;
  metric: GarminMetric;
  date: string;
  value: number;
}
