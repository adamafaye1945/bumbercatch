export interface FavoritePlace {
  id: string;
  name: string;
  etaMinutes: number;
  distanceMiles: number;
  traffic: string;
}

export const favoritePlaces: FavoritePlace[] = [
  { id: "p1", name: "JPMC office", etaMinutes: 18, distanceMiles: 3.2, traffic: "light traffic" },
  { id: "p2", name: "Gym", etaMinutes: 6, distanceMiles: 1.1, traffic: "clear" },
  { id: "p3", name: "Dad's garage", etaMinutes: 22, distanceMiles: 5.4, traffic: "moderate traffic" },
];
