import { useEffect } from "react";
import type { ComponentType } from "react";
import { Bell, Mail, HeartPulse, AlarmClock } from "lucide-react";
import type { LucideProps } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/queries";

const sourceIcons: Record<string, ComponentType<LucideProps>> = {
  Email: Mail,
  Garmin: HeartPulse,
  Reminder: AlarmClock,
};

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Notifications() {
  const { data: notifications, isLoading, isError } = useNotifications();
  const markAllRead = useMarkNotificationsRead();

  useEffect(() => {
    if (notifications && notifications.some((n) => !n.read)) {
      markAllRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  return (
    <div>
      <PageHeader title="Notifications" icon={Bell} />
      {isLoading ? (
        <LoadingState />
      ) : isError || !notifications ? (
        <DataUnavailable />
      ) : notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((item) => (
            <ListRow
              key={item.id}
              icon={sourceIcons[item.source]}
              title={item.source}
              titleRight={formatNotificationTime(item.createdAt)}
              subtitle={item.message}
            />
          ))}
        </div>
      )}
    </div>
  );
}
