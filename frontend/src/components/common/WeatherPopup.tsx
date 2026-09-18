import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useWeatherForecast } from "@/hooks/queries";
import { iconToEmoji } from "@/lib/weather";

function formatDayLabel(date: string, index: number): string {
  if (index === 0) return "Today";
  return new Date(date).toLocaleDateString(undefined, { weekday: "long" });
}

export function WeatherPopup({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: days, isLoading, isError } = useWeatherForecast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>5-Day Forecast</DialogTitle>
        {isLoading ? (
          <LoadingState />
        ) : isError || !days || days.length === 0 ? (
          <DataUnavailable message="Weather unavailable" />
        ) : (
          <div className="divide-y divide-border">
            {days.map((day, i) => (
              <div key={day.date} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{iconToEmoji(day.icon)}</span>
                  <div>
                    <div className="font-medium">{formatDayLabel(day.date, i)}</div>
                    <div className="text-sm capitalize text-muted-foreground">{day.description}</div>
                  </div>
                </div>
                <div className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">{Math.round(day.tempMax)}°</span>
                  {" / "}
                  {Math.round(day.tempMin)}°
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
