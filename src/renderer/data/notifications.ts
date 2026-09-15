export interface NotificationItem {
  id: string;
  source: string;
  timestamp: string;
  message: string;
}

export const notifications: NotificationItem[] = [
  { id: "n1", source: "Slack", timestamp: "9:58 AM", message: "Adama, standup starting soon" },
  { id: "n2", source: "Messages", timestamp: "9:40 AM", message: "Dad: call me when free" },
  { id: "n3", source: "Calendar", timestamp: "9:30 AM", message: "1:1 with manager in 30 min" },
  { id: "n4", source: "Gmail", timestamp: "9:12 AM", message: "New reply on JPMC onboarding" },
  { id: "n5", source: "rent-a-taxi", timestamp: "8:50 AM", message: "New booking request" },
];
