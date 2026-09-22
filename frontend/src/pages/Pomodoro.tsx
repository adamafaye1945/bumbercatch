import { useEffect, useState } from "react";
import { Timer, Play, Pause, RotateCcw, SkipForward } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "work" | "shortBreak" | "longBreak";

interface TimerState {
  phase: Phase;
  secondsLeft: number;
  completedWorkSessions: number;
}

const DURATIONS: Record<Phase, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
const SESSIONS_BEFORE_LONG_BREAK = 4;

const PHASE_LABEL: Record<Phase, string> = {
  work: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

function initialState(): TimerState {
  return { phase: "work", secondsLeft: DURATIONS.work, completedWorkSessions: 0 };
}

// Standard Pomodoro cycle: 25min focus -> 5min break, four times, then a
// 15min break before the cycle repeats.
function advance(state: TimerState): TimerState {
  if (state.phase === "work") {
    const completedWorkSessions = state.completedWorkSessions + 1;
    const phase: Phase = completedWorkSessions % SESSIONS_BEFORE_LONG_BREAK === 0 ? "longBreak" : "shortBreak";
    return { phase, secondsLeft: DURATIONS[phase], completedWorkSessions };
  }
  return { phase: "work", secondsLeft: DURATIONS.work, completedWorkSessions: state.completedWorkSessions };
}

const RADIUS = 120;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Pomodoro() {
  const [state, setState] = useState<TimerState>(initialState);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setState((prev) => (prev.secondsLeft <= 1 ? advance(prev) : { ...prev, secondsLeft: prev.secondsLeft - 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  function reset() {
    setIsRunning(false);
    setState(initialState());
  }

  const total = DURATIONS[state.phase];
  const fraction = state.secondsLeft / total;
  const minutes = Math.floor(state.secondsLeft / 60);
  const seconds = state.secondsLeft % 60;
  const isWork = state.phase === "work";

  return (
    <div>
      <PageHeader title="Pomodoro" icon={Timer} />
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-sm font-medium text-muted-foreground">
          {PHASE_LABEL[state.phase]} · Session {state.completedWorkSessions + 1}
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={280} height={280} viewBox="0 0 280 280" className="-rotate-90">
            <circle cx={140} cy={140} r={RADIUS} strokeWidth={STROKE} className="stroke-border" fill="none" />
            <circle
              cx={140}
              cy={140}
              r={RADIUS}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              className={cn(
                "transition-[stroke-dashoffset] duration-1000 ease-linear",
                isWork ? "stroke-destructive" : "stroke-success"
              )}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
            />
          </svg>
          <div className="absolute text-5xl font-semibold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" aria-label="Reset" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
          <Button onClick={() => setIsRunning((running) => !running)}>
            {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" size="icon" aria-label="Skip to next phase" onClick={() => setState(advance)}>
            <SkipForward className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
