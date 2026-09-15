import { useState } from "react";
import { Bell, Mail, HeartPulse, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { StatusPill } from "@/components/common/StatusPill";
import { StatGrid } from "@/components/common/StatGrid";
import { StatTile } from "@/components/common/StatTile";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChecklistItem } from "@/components/common/ChecklistItem";
import { ListRow } from "@/components/common/ListRow";
import { ActionBanner } from "@/components/common/ActionBanner";
import { ReminderPopup } from "@/components/common/ReminderPopup";
import { VoiceAssistPopup } from "@/components/common/VoiceAssistPopup";
import { homeStatus } from "@/data/homeStatus";
import { checklistItems } from "@/data/checklist";
import { favoritePlaces } from "@/data/places";
import { notifications } from "@/data/notifications";
import { emails } from "@/data/emails";
import { garminStats } from "@/data/garmin";

export function Home() {
  const doneCount = checklistItems.filter((item) => item.checked).length;
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-start justify-between">
        <ThemeToggleButton />
      </div>

      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <div className="text-4xl font-semibold tabular-nums">{homeStatus.time}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {homeStatus.date} · {homeStatus.weather}
          </div>
        </div>
        <StatusPill
          label={homeStatus.listening.label}
          active={homeStatus.listening.active}
          onClick={() => setVoiceOpen(true)}
        />
      </div>

      <StatGrid columns={3} className="border-b border-border pb-6">
        <StatTile label="Notifications" value={notifications.length} icon={Bell} to="/notifications" />
        <StatTile
          label="Email"
          value={`${emails.filter((e) => e.unread).length} unread`}
          icon={Mail}
          to="/email"
        />
        <StatTile label="Body battery" value={garminStats.bodyBattery.value} icon={HeartPulse} to="/garmin" />
      </StatGrid>

      <section>
        <SectionHeader title="Today" meta={`${doneCount} of ${checklistItems.length} done`} to="/today" />
        <div>
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.label}
              checked={item.checked}
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

      <ActionBanner
        message={homeStatus.leaveBanner.message}
        actionLabel={homeStatus.leaveBanner.actionLabel}
        onAction={() => {}}
        onClick={() => setReminderOpen(true)}
      />

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={() => setReminderOpen(true)}>
          Test: reminder popup
        </Button>
        <Button variant="outline" size="sm" onClick={() => setVoiceOpen(true)}>
          Test: voice popup
        </Button>
      </div>

      <VoiceAssistPopup open={voiceOpen} onOpenChange={setVoiceOpen} />
      <ReminderPopup
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        title="Upcoming reminder"
        message={homeStatus.leaveBanner.message}
        actionLabel={homeStatus.leaveBanner.actionLabel}
        onAction={() => {}}
      />
    </div>
  );
}
