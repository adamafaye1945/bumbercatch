import type { WeekPoint } from "@/data/garminWeekly";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = 128;

export function WeekBarChart({ data }: { data: WeekPoint[] }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: CHART_HEIGHT }}>
        {data.map((point, i) => {
          const isToday = i === data.length - 1;
          const pct = Math.max((point.value / max) * 100, 6);
          return (
            <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] tabular-nums text-muted-foreground">{point.displayValue}</span>
              <div
                className={cn("w-full rounded-t-sm", isToday ? "bg-primary" : "bg-muted")}
                style={{ height: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((point) => (
          <span key={point.label} className="flex-1 text-center text-xs text-muted-foreground">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
