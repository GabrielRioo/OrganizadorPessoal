import { api } from "./api";
import type { MediaKind } from "../types/models";

export type GameCatalogHit = {
  title: string;
  coverUrl: string | null;
  playtimeHours: number | null;
  platform: string | null;
  year: number | null;
};

export type MediaCatalogHit = {
  title: string;
  coverUrl: string | null;
  kind: MediaKind;
  genre: string | null;
  year: number | null;
};

type CatalogResponse<T> = {
  available: boolean;
  results: T[];
};

export const catalogService = {
  searchGames: (q: string) =>
    api.get<CatalogResponse<GameCatalogHit>>(`/api/catalog/games?q=${encodeURIComponent(q)}`),
  searchMedia: (q: string, kind: MediaKind) =>
    api.get<CatalogResponse<MediaCatalogHit>>(
      `/api/catalog/media?q=${encodeURIComponent(q)}&kind=${encodeURIComponent(kind)}`,
    ),
};
