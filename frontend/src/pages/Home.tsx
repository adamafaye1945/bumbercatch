import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, HeartPulse, MapPin, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { StatGrid } from "@/components/common/StatGrid";
import { StatTile } from "@/components/common/StatTile";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChecklistItem } from "@/components/common/ChecklistItem";
import { ListRow } from "@/components/common/ListRow";
import { ActionBanner } from "@/components/common/ActionBanner";
import { ReminderPopup } from "@/components/common/ReminderPopup";
import { VoiceAssistPopup } from "@/components/common/VoiceAssistPopup";
import { WeatherPopup } from "@/components/common/WeatherPopup";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { iconToEmoji } from "@/lib/weather";
import {
  useHomeStatus,
  useChecklist,
  useDeleteChecklistItem,
  usePlaces,
  useNotifications,
  useEmails,
  useGarminStats,
  useReminders,
  useDismissReminder,
  useSnoozeReminder,
  useOnCheck,
} from "@/hooks/queries";

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatDueAt(dueAt: string): string {
  return new Date(dueAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeLeft(dueAt: string): string {
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const overdue = diffMs < 0;
  const totalMinutes = Math.round(Math.abs(diffMs) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const span = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return overdue ? `Overdue by ${span}` : `in ${span}`;
}

export function Home() {
  const now = useNow();
  const queryClient = useQueryClient();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const wasListeningRef = useRef(false);

  const homeStatusRes = useHomeStatus();
  const checklistRes = useChecklist();
  const placesRes = usePlaces();
  const notificationsRes = useNotifications();
  const emailsRes = useEmails();
  const garminRes = useGarminStats();
  const remindersRes = useReminders();
  const dismissReminder = useDismissReminder();
  const snoozeReminder = useSnoozeReminder();
  const deleteChecklistItem = useDeleteChecklistItem();
  const updateChecklistItem = useOnCheck()

  const isLoading =
    homeStatusRes.isLoading ||
    checklistRes.isLoading ||
    placesRes.isLoading ||
    notificationsRes.isLoading ||
    emailsRes.isLoading ||
    garminRes.isLoading ||
    remindersRes.isLoading;

  const homeStatus = homeStatusRes.data;

  useEffect(() => {
    if (!homeStatus) return;
    const active = homeStatus.listening.active;
    setVoiceOpen(active);
    // The daemon writes reminders/checklist items directly via HTTP, outside
    // React Query's mutation flow, so nothing else invalidates these lists --
    // refresh them right as a voice interaction finishes (active: true -> false).
    if (wasListeningRef.current && !active) {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    }
    wasListeningRef.current = active;
  }, [homeStatus?.listening.active, queryClient]);

  function handleVoiceOpenChange(open: boolean) {
    setVoiceOpen(open);
    if (!open && homeStatus?.listening.active) {
      // User dismissed the popup (Escape/click outside) while the daemon is
      // still recording -- tell it to abort rather than let it keep going unseen.
      apiFetch("/voice/cancel", { method: "POST" }).catch(() => {});
    }
  }

  const checklistItems = checklistRes.data;
  const favoritePlaces = placesRes.data;
  const notifications = notificationsRes.data;
  const emails = emailsRes.data;
  const garminStats = garminRes.data;
  const reminders = remindersRes.data;

  const isError =
    homeStatusRes.isError ||
    checklistRes.isError ||
    placesRes.isError ||
    notificationsRes.isError ||
    emailsRes.isError ||
    garminRes.isError ||
    remindersRes.isError;

  if (isLoading) return <LoadingState />;
  if (
    isError ||
    !homeStatus ||
    !checklistItems ||
    !favoritePlaces ||
    !notifications ||
    !emails ||
    !garminStats ||
    !reminders
  ) {
    return <DataUnavailable />;
  }

  const doneCount = checklistItems.filter((item) => item.checked).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const activeReminders = reminders
    .filter((r) => !r.dismissedAt)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const upcomingReminder = activeReminders[0];

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-start justify-between">
        <ThemeToggleButton />
      </div>

      <div className="border-b border-border pb-6">
        <div className="text-4xl font-semibold tabular-nums">
          {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} ·{" "}
          <button
            type="button"
            onClick={() => setWeatherOpen(true)}
            className="transition-colors hover:text-foreground"
          >
            {iconToEmoji(homeStatus.weatherIcon)} {homeStatus.weather}
          </button>
        </div>
      </div>

      <StatGrid columns={3} className="border-b border-border pb-6">
        <StatTile label="Notifications" value={unreadNotifications} icon={Bell} to="/notifications" />
        <StatTile
          label="Email"
          value={`${emails.filter((e) => e.unread).length} unread`}
          icon={Mail}
          to="/email"
        />
        <StatTile label="Body battery" value={garminStats.bodyBattery.value} icon={HeartPulse} to="/garmin" />
      </StatGrid>

      {activeReminders.length > 0 && (
        <section>
          <SectionHeader title="Reminders" />
          <div className="divide-y divide-border">
            {activeReminders.map((reminder) => (
              <ListRow
                key={reminder.id}
                title={reminder.label}
                subtitle={formatDueAt(reminder.dueAt)}
                titleRight={formatTimeLeft(reminder.dueAt)}
                trailingAction={{ label: "Snooze", onClick: () => snoozeReminder.mutate({ id: reminder.id }) }}
                trailingIcon={{
                  icon: Trash2,
                  label: `Dismiss ${reminder.label}`,
                  onClick: () => dismissReminder.mutate(reminder.id),
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Today" meta={`${doneCount} of ${checklistItems.length} done`} to="/today" />
        <div>
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.label}
              checked={item.checked}
              onCheck={() => updateChecklistItem.mutate({ id: item.id, checked: !item.checked })}
              onDelete={() => deleteChecklistItem.mutate(item.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Favorite places" to="/places" />
        <div className="divide-y divide-border">
          {favoritePlaces.map((place) => (
            <ListRow
              key={place.id}
              icon={MapPin}
              title={place.name}
              trailingAction={{ label: "Ask for time", onClick: () => {} }}
            />
          ))}
        </div>
      </section>

      {upcomingReminder && (
        <>
          <ActionBanner
            message={upcomingReminder.label}
            actionLabel="Snooze"
            onAction={() => snoozeReminder.mutate({ id: upcomingReminder.id })}
            onClick={() => setReminderOpen(true)}
          />

          <ReminderPopup
            open={reminderOpen}
            onOpenChange={setReminderOpen}
            title="Upcoming reminder"
            message={upcomingReminder.label}
            actionLabel="Snooze"
            onAction={() => snoozeReminder.mutate({ id: upcomingReminder.id })}
            onDismiss={() => dismissReminder.mutate(upcomingReminder.id)}
          />
        </>
      )}

      <VoiceAssistPopup
        open={voiceOpen}
        onOpenChange={handleVoiceOpenChange}
        label={homeStatus.listening.label}
        resultText={homeStatus.voiceResult}
      />

      <WeatherPopup open={weatherOpen} onOpenChange={setWeatherOpen} />
    </div>
  );
}
