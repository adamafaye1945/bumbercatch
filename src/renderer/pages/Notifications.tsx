import type { ComponentType } from "react";
import { Bell, MessageSquare, MessageCircle, Calendar, Mail, Car } from "lucide-react";
import type { LucideProps } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { notifications } from "@/data/notifications";

const sourceIcons: Record<string, ComponentType<LucideProps>> = {
  Slack: MessageSquare,
  Messages: MessageCircle,
  Calendar: Calendar,
  Gmail: Mail,
  "rent-a-taxi": Car,
};

export function Notifications() {
  return (
    <div>
      <PageHeader title="Notifications" icon={Bell} />
      <div className="divide-y divide-border">
        {notifications.map((item) => (
          <ListRow
            key={item.id}
            icon={sourceIcons[item.source]}
            title={item.source}
            titleRight={item.timestamp}
            subtitle={item.message}
          />
        ))}
      </div>
    </div>
  );
}
