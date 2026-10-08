import type { Travel, TravelStatus } from "../types/models";
import { api } from "./api";

export type TravelPayload = {
  place: string;
  country?: string | null;
  status: TravelStatus;
  visitedAt?: string | null;
  notes?: string | null;
};

export const travelService = {
  list: (q = "", status: TravelStatus | "" = "") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const query = params.toString();
    return api.get<Travel[]>(query ? `/api/travels?${query}` : "/api/travels");
  },
  create: (payload: TravelPayload) => api.post<Travel>("/api/travels", payload),
  update: (id: string, payload: Partial<TravelPayload>) =>
    api.patch<Travel>(`/api/travels/${id}`, payload),
  remove: (id: string) => api.delete(`/api/travels/${id}`),
};
