import { MapPin } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { favoritePlaces } from "@/data/places";

export function Places() {
  return (
    <div>
      <PageHeader title="Favorite places" icon={MapPin} />
      <p className="mb-4 text-sm text-muted-foreground">
        Say &quot;how long to the gym&quot; to check
      </p>
      <div className="divide-y divide-border">
        {favoritePlaces.map((place) => (
          <ListRow
            key={place.id}
            icon={MapPin}
            title={place.name}
            titleRight={`${place.etaMinutes} min`}
            caption={`${place.distanceMiles} mi · ${place.traffic}`}
          />
        ))}
      </div>
    </div>
  );
}
