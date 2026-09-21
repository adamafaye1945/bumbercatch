import { Trophy } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useR6Leaderboard } from "@/hooks/queries";

// A win percentage is directly comparable across players regardless of how
// many games each has played, unlike raw win/loss counts.
function formatWinRate(wins: number | null, losses: number | null): string | null {
  if (wins === null || losses === null || wins + losses === 0) return null;
  return `${Math.round((wins / (wins + losses)) * 100)}% win rate`;
}

export function R6Leaderboard() {
  const { data: players, isLoading, isError } = useR6Leaderboard();

  return (
    <div>
      <PageHeader title="R6 Leaderboard" icon={Trophy} />
      {isLoading ? (
        <LoadingState />
      ) : isError || !players || players.length === 0 ? (
        <DataUnavailable message="No players tracked yet" />
      ) : (
        <div className="divide-y divide-border">
          {players.map((player, i) => (
            <ListRow
              key={player.gamertag}
              icon={i === 0 ? Trophy : undefined}
              title={player.gamertag}
              subtitle={player.rankName ?? "No data yet"}
              titleRight={player.rankPoints !== null ? `${player.rankPoints} RP` : undefined}
              caption={
                player.kdRatio !== null
                  ? [`K/D ${player.kdRatio.toFixed(2)}`, formatWinRate(player.wins, player.losses)]
                      .filter(Boolean)
                      .join(" · ")
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
