import type { MediaItem, MediaKind, MediaRating, MediaStatus } from "../types/models";
import { api } from "./api";

export type MediaPayload = {
  title: string;
  kind: MediaKind;
  status: MediaStatus;
  currentSeason?: number | null;
  currentEpisode?: number | null;
  rating?: MediaRating | null;
  genre?: string | null;
  watchedOn?: string | null;
  notes?: string | null;
  coverUrl?: string | null;
  year?: number | null;
};

export type MediaFilters = {
  q?: string;
  kind?: MediaKind | "";
  status?: MediaStatus | "";
};

function mediaQuery(filters: MediaFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `/api/media?${query}` : "/api/media";
}

export const mediaService = {
  list: (filters: MediaFilters = {}) => api.get<MediaItem[]>(mediaQuery(filters)),
  create: (payload: MediaPayload) => api.post<MediaItem>("/api/media", payload),
  update: (id: string, payload: Partial<MediaPayload>) =>
    api.patch<MediaItem>(`/api/media/${id}`, payload),
  remove: (id: string) => api.delete(`/api/media/${id}`),
};
