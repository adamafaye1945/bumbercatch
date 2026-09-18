import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const PULL_THRESHOLD = 70; // px of downward pull needed to trigger a refresh
const MAX_PULL = 100;

// Wraps the whole app (mounted once in AppShell) so pulling down from the top
// of any page refetches every React Query cache entry -- mirrors a phone's
// pull-to-refresh gesture. Pointer Events cover touch, mouse, and pen in one
// API, so this is testable with a trackpad/mouse too, not just a touchscreen.
export function PullToRefresh({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (refreshing || window.scrollY > 0) return;
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (startYRef.current === null || refreshing) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0 && window.scrollY <= 0) {
      setPullDistance(Math.min(delta, MAX_PULL));
    } else {
      startYRef.current = null;
      setPullDistance(0);
    }
  }

  async function handlePointerUp() {
    if (startYRef.current === null) return;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      await queryClient.invalidateQueries();
      setRefreshing(false);
    }
    setPullDistance(0);
  }

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="flex items-center justify-center overflow-hidden text-muted-foreground transition-[height] duration-150 ease-out"
        style={{ height: refreshing ? PULL_THRESHOLD : pullDistance }}
      >
        <RefreshCw
          className={cn("size-5", refreshing && "animate-spin")}
          style={!refreshing ? { transform: `rotate(${progress * 360}deg)`, opacity: progress } : undefined}
        />
      </div>
      {children}
    </div>
  );
}
