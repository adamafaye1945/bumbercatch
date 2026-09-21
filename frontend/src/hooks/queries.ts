import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  ChecklistItem,
  EmailItem,
  NotificationItem,
  FavoritePlace,
  HomeStatus,
  GarminStats,
  GarminWeeklyPoint,
  GarminMetric,
  Reminder,
  WeatherDay,
  R6PlayerStats,
} from "@/types/api";

export function useChecklist() {
  return useQuery({
    queryKey: ["checklist"],
    queryFn: () => apiFetch<ChecklistItem[]>("/checklist"),
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/checklist/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
  });
}
export function useOnCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      apiFetch<ChecklistItem>(`/checklist/${id}`, { method: "PATCH", body: JSON.stringify({ checked }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
  });
}
export function useEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: () => apiFetch<EmailItem[]>("/emails"),
  });
}

export function useEmail(id: string | undefined) {
  return useQuery({
    queryKey: ["emails", id],
    queryFn: () => apiFetch<EmailItem>(`/emails/${id}`),
    enabled: !!id,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<NotificationItem[]>("/notifications"),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function usePlaces() {
  return useQuery({
    queryKey: ["places"],
    queryFn: () => apiFetch<FavoritePlace[]>("/places"),
  });
}

export function useHomeStatus() {
  return useQuery({
    queryKey: ["home-status"],
    queryFn: () => apiFetch<HomeStatus>("/home-status"),
    // Short interval so the voice-control "Listening" indicator (flipped by
    // the daemon via PATCH /api/home-status) shows up promptly on the kiosk screen.
    // Runs entirely on localhost, so a sub-second interval is cheap.
    refetchInterval: 500,
  });
}

export function useGarminStats() {
  return useQuery({
    queryKey: ["garmin-stats"],
    queryFn: () => apiFetch<GarminStats>("/garmin-stats"),
  });
}

export function useGarminWeekly(metric: GarminMetric) {
  return useQuery({
    queryKey: ["garmin-weekly", metric],
    queryFn: () => apiFetch<GarminWeeklyPoint[]>(`/garmin-weekly?metric=${metric}`),
  });
}

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: () => apiFetch<Reminder[]>("/reminders"),
    refetchInterval: 60_000,
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Reminder>(`/reminders/${id}/dismiss`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useWeatherForecast() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: () => apiFetch<WeatherDay[]>("/weather"),
    // Matches the backend's own refresh cadence (every 15 min).
    refetchInterval: 15 * 60 * 1000,
  });
}

export function useR6Leaderboard() {
  return useQuery({
    queryKey: ["r6-leaderboard"],
    queryFn: () => apiFetch<R6PlayerStats[]>("/r6/leaderboard"),
    // Backend only syncs once a day (rate-limit budget), so no aggressive
    // polling here -- the default mount-time fetch is enough.
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes?: number }) =>
      apiFetch<Reminder>(`/reminders/${id}/snooze`, {
        method: "POST",
        body: JSON.stringify({ minutes }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
