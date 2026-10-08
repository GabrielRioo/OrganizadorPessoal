import type { DashboardData, Game, GameStatus } from "../types/models";
import { api } from "./api";

export type GamePayload = {
  title: string;
  platform: string;
  status: GameStatus;
  queuePosition?: number | null;
  notes?: string | null;
  coverUrl?: string | null;
  playtimeHours?: number | null;
};

export type GameSort = "queue" | "updated" | "title" | "hours" | "added";

export type GameFilters = {
  q?: string;
  status?: GameStatus | "";
  platform?: string;
  sort?: GameSort;
  invert?: boolean;
};

function gamesQuery(filters: GameFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.sort && filters.sort !== "queue") params.set("sort", filters.sort);
  if (filters.invert) params.set("invert", "true");
  const query = params.toString();
  return query ? `/api/games?${query}` : "/api/games";
}

export const gameService = {
  list: (filters: GameFilters = {}) => api.get<Game[]>(gamesQuery(filters)),
  platforms: () => api.get<string[]>("/api/games/platforms"),
  create: (payload: GamePayload) => api.post<Game>("/api/games", payload),
  update: (id: string, payload: Partial<GamePayload>) =>
    api.patch<Game>(`/api/games/${id}`, payload),
  remove: (id: string) => api.delete(`/api/games/${id}`),
};

export const dashboardService = {
  get: () => api.get<DashboardData>("/api/dashboard"),
};
