import { Trophy } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useR6Leaderboard } from "@/hooks/queries";

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
                  ? `K/D ${player.kdRatio.toFixed(2)} · ${player.wins ?? 0}W-${player.losses ?? 0}L`
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
