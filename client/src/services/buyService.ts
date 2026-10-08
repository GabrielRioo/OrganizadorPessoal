import type { BuyCurrency, BuyItem, BuyPriority, BuyStatus } from "../types/models";
import { api } from "./api";

export type BuyLinkPayload = {
  url: string;
  label?: string | null;
};

export type BuyItemPayload = {
  name: string;
  description?: string | null;
  category?: string | null;
  currentPrice?: number | null;
  targetPrice?: number | null;
  currency?: BuyCurrency;
  quantity?: number;
  priority: BuyPriority;
  status: BuyStatus;
  links?: BuyLinkPayload[];
  notes?: string | null;
};

export type BuyItemFilters = {
  q?: string;
  status?: BuyStatus | "";
  priority?: BuyPriority | "";
  category?: string;
};

function buyItemsQuery(filters: BuyItemFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return query ? `/api/buy-items?${query}` : "/api/buy-items";
}

export const buyService = {
  list: (filters: BuyItemFilters = {}) => api.get<BuyItem[]>(buyItemsQuery(filters)),
  create: (payload: BuyItemPayload) => api.post<BuyItem>("/api/buy-items", payload),
  update: (id: string, payload: Partial<BuyItemPayload>) =>
    api.patch<BuyItem>(`/api/buy-items/${id}`, payload),
  remove: (id: string) => api.delete(`/api/buy-items/${id}`),
};
