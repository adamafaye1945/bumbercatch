import { useState } from "react";
import { HeartPulse, Footprints, Moon, Activity } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { StatGrid } from "@/components/common/StatGrid";
import { WeekBarChart } from "@/components/common/WeekBarChart";
import { garminStats } from "@/data/garmin";
import {
  bodyBatteryWeek,
  stepsWeek,
  restingHrWeek,
  sleepWeek,
  stressWeek,
  type WeekPoint,
} from "@/data/garminWeekly";

type MetricKey = "bodyBattery" | "steps" | "restingHr" | "sleep" | "stress";

const metricDetails: Record<MetricKey, { title: string; description: string; data: WeekPoint[] }> = {
  bodyBattery: {
    title: "Body battery — past week",
    description: garminStats.bodyBattery.caption,
    data: bodyBatteryWeek,
  },
  steps: {
    title: "Steps — past week",
    description: `Goal: ${garminStats.steps.goal.toLocaleString()}`,
    data: stepsWeek,
  },
  restingHr: {
    title: "Resting HR — past week",
    description: garminStats.restingHr.caption,
    data: restingHrWeek,
  },
  sleep: {
    title: "Sleep — past week",
    description: garminStats.sleep.deepCaption,
    data: sleepWeek,
  },
  stress: {
    title: "Stress — past week",
    description: garminStats.stress.caption,
    data: stressWeek,
  },
};

export function Garmin() {
  const [selected, setSelected] = useState<MetricKey>("bodyBattery");
  const detail = metricDetails[selected];

  return (
    <div>
      <PageHeader title="Garmin" icon={HeartPulse} />

      <div className="border-b border-border pb-6">
        <StatTile
          label="Body battery"
          value={garminStats.bodyBattery.value}
          caption={garminStats.bodyBattery.caption}
          icon={HeartPulse}
          selected={selected === "bodyBattery"}
          onClick={() => setSelected("bodyBattery")}
        />
      </div>

      <div className="flex flex-col gap-6 border-b border-border py-6">
        <StatGrid columns={2}>
          <StatTile
            label="Steps"
            value={garminStats.steps.value.toLocaleString()}
            caption={`Goal: ${garminStats.steps.goal.toLocaleString()}`}
            icon={Footprints}
            selected={selected === "steps"}
            onClick={() => setSelected("steps")}
          />
          <StatTile
            label="Resting HR"
            value={`${garminStats.restingHr.value} bpm`}
            caption={garminStats.restingHr.caption}
            icon={HeartPulse}
            selected={selected === "restingHr"}
            onClick={() => setSelected("restingHr")}
          />
        </StatGrid>
        <StatGrid columns={2}>
          <StatTile
            label="Sleep"
            value={garminStats.sleep.total}
            caption={garminStats.sleep.deepCaption}
            icon={Moon}
            selected={selected === "sleep"}
            onClick={() => setSelected("sleep")}
          />
          <StatTile
            label="Stress"
            value={garminStats.stress.level}
            caption={garminStats.stress.caption}
            icon={Activity}
            selected={selected === "stress"}
            onClick={() => setSelected("stress")}
          />
        </StatGrid>
      </div>

      <div className="pt-6">
        <h2 className="text-sm font-medium">{detail.title}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{detail.description}</p>
        <WeekBarChart data={detail.data} />
      </div>
    </div>
  );
}
