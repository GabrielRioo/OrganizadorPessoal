import { useCallback, useEffect, useState } from "react";
import type { MediaItem, MediaKind, MediaStatus } from "../../../types/models";
import { mediaService, type MediaFilters, type MediaPayload } from "../../../services/mediaService";

export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MediaFilters>({ q: "", kind: "", status: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mediaService.list(filters);
      setItems(data);
    } catch {
      setError("Não foi possível carregar filmes, séries e animes.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(payload: MediaPayload) {
    await mediaService.create(payload);
    await load();
  }

  async function update(id: string, payload: Partial<MediaPayload>) {
    await mediaService.update(id, payload);
    await load();
  }

  async function remove(id: string) {
    await mediaService.remove(id);
    await load();
  }

  return {
    items,
    loading,
    error,
    filters,
    load,
    create,
    update,
    remove,
    setQuery: (q: string) => setFilters((current) => ({ ...current, q })),
    setKind: (kind: MediaKind | "") => setFilters((current) => ({ ...current, kind })),
    setStatus: (status: MediaStatus | "") => setFilters((current) => ({ ...current, status })),
  };
}
