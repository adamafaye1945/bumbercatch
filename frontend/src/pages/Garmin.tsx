import { useState } from "react";
import { HeartPulse, Footprints, Moon, Activity } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { StatGrid } from "@/components/common/StatGrid";
import { WeekBarChart, type WeekPoint } from "@/components/common/WeekBarChart";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { Spinner } from "@/components/ui/spinner";
import { useGarminStats, useGarminWeekly } from "@/hooks/queries";
import type { GarminMetric } from "@/types/api";

const metricTitles: Record<GarminMetric, string> = {
  bodyBattery: "Body battery — past week",
  steps: "Steps — past week",
  restingHr: "Resting HR — past week",
  sleep: "Sleep — past week",
  stress: "Stress — past week",
};

function formatWeekdayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  // Construct in local time (not UTC) so a "YYYY-MM-DD" date string doesn't
  // shift to the previous day for timezones behind UTC.
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: "short" });
}

function formatMetricValue(metric: GarminMetric, value: number): string {
  switch (metric) {
    case "steps":
      return value.toLocaleString();
    case "sleep": {
      const hours = Math.floor(value);
      const minutes = Math.round((value % 1) * 60);
      return `${hours}h${minutes}m`;
    }
    default:
      return `${value}`;
  }
}

export function Garmin() {
  const [selected, setSelected] = useState<GarminMetric>("bodyBattery");

  const { data: stats, isLoading: statsLoading, isError: statsError } = useGarminStats();
  const {
    data: weeklyPoints,
    isLoading: weeklyLoading,
    isError: weeklyError,
  } = useGarminWeekly(selected);

  if (statsLoading) {
    return (
      <div>
        <PageHeader title="Garmin" icon={HeartPulse} />
        <LoadingState />
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div>
        <PageHeader title="Garmin" icon={HeartPulse} />
        <DataUnavailable />
      </div>
    );
  }

  const metricDescriptions: Record<GarminMetric, string> = {
    bodyBattery: stats.bodyBattery.caption,
    steps: `Goal: ${stats.steps.goal.toLocaleString()}`,
    restingHr: stats.restingHr.caption,
    sleep: stats.sleep.deepCaption,
    stress: stats.stress.caption,
  };

  const chartData: WeekPoint[] = (weeklyPoints ?? []).map((point) => ({
    label: formatWeekdayLabel(point.date),
    value: point.value,
    displayValue: formatMetricValue(selected, point.value),
  }));

  return (
    <div>
      <PageHeader title="Garmin" icon={HeartPulse} />

      <div className="border-b border-border pb-6">
        <StatTile
          label="Body battery"
          value={stats.bodyBattery.value}
          caption={stats.bodyBattery.caption}
          icon={HeartPulse}
          size="hero"
          selected={selected === "bodyBattery"}
          onClick={() => setSelected("bodyBattery")}
        />
      </div>

      <div className="flex flex-col gap-6 border-b border-border py-6">
        <StatGrid columns={2}>
          <StatTile
            label="Steps"
            value={stats.steps.value.toLocaleString()}
            caption={`Goal: ${stats.steps.goal.toLocaleString()}`}
            icon={Footprints}
            selected={selected === "steps"}
            onClick={() => setSelected("steps")}
          />
          <StatTile
            label="Resting HR"
            value={`${stats.restingHr.value} bpm`}
            caption={stats.restingHr.caption}
            icon={HeartPulse}
            selected={selected === "restingHr"}
            onClick={() => setSelected("restingHr")}
          />
        </StatGrid>
        <StatGrid columns={2}>
          <StatTile
            label="Sleep"
            value={stats.sleep.total}
            caption={stats.sleep.deepCaption}
            icon={Moon}
            selected={selected === "sleep"}
            onClick={() => setSelected("sleep")}
          />
          <StatTile
            label="Stress"
            value={stats.stress.level}
            caption={stats.stress.caption}
            icon={Activity}
            selected={selected === "stress"}
            onClick={() => setSelected("stress")}
          />
        </StatGrid>
      </div>

      <div className="pt-6">
        <h2 className="text-sm font-medium">{metricTitles[selected]}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{metricDescriptions[selected]}</p>
        {weeklyLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : weeklyError || !weeklyPoints ? (
          <DataUnavailable message="Weekly data unavailable" />
        ) : weeklyPoints.length === 0 ? (
          <DataUnavailable message="No history yet" />
        ) : (
          <WeekBarChart data={chartData} />
        )}
      </div>
    </div>
  );
}
