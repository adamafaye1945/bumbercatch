import { MapPin } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { usePlaces } from "@/hooks/queries";

export function Places() {
  const { data: places, isLoading, isError } = usePlaces();

  return (
    <div>
      <PageHeader title="Favorite places" icon={MapPin} />
      <p className="mb-4 text-sm text-muted-foreground">
        Say &quot;how long to the gym&quot; to check
      </p>
      {isLoading ? (
        <LoadingState />
      ) : isError || !places ? (
        <DataUnavailable />
      ) : (
        <div className="divide-y divide-border">
          {places.map((place) => (
            <ListRow
              key={place.id}
              icon={MapPin}
              title={place.name}
              titleRight={`${place.etaMinutes} min`}
              caption={`${place.distanceMiles} mi · ${place.traffic}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
