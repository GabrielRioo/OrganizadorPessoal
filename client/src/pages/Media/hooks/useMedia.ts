import { useCallback, useEffect, useState } from "react";
import type { MediaItem, MediaKind, MediaStatus } from "../../../types/models";
import { mediaService, type MediaFilters, type MediaPayload } from "../../../services/mediaService";

const pageSize = 24;

export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<MediaFilters>({
    q: "",
    kind: "",
    status: "",
    page: 1,
    pageSize,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mediaService.list(filters);
      setItems(data.items);
      setCount(data.count);
      setPageCount(data.pageCount);
      if ((filters.page ?? 1) > data.pageCount) {
        setFilters((current) => ({ ...current, page: data.pageCount }));
      }
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

  function resetPage(next: MediaFilters): MediaFilters {
    return { ...next, page: 1 };
  }

  return {
    items,
    loading,
    error,
    filters,
    count,
    page: filters.page ?? 1,
    pageCount,
    load,
    create,
    update,
    remove,
    setQuery: (q: string) => setFilters((current) => resetPage({ ...current, q })),
    setKind: (kind: MediaKind | "") => setFilters((current) => resetPage({ ...current, kind })),
    setStatus: (status: MediaStatus | "") => setFilters((current) => resetPage({ ...current, status })),
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
  };
}
