import { useCallback, useEffect, useState } from "react";
import type { Game, GameStatus } from "../../../types/models";
import {
  gameService,
  type GameFilters,
  type GamePayload,
  type GameQueuePreview,
  type GameSort,
} from "../../../services/gameService";

const pageSize = 24;

export function useGames() {
  const [items, setItems] = useState<Game[]>([]);
  const [queuePreview, setQueuePreview] = useState<GameQueuePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<GameFilters>({
    q: "",
    status: "",
    platform: "",
    sort: "queue",
    invert: false,
    page: 1,
    pageSize,
  });

  const loadPlatforms = useCallback(async () => {
    try {
      setPlatforms(await gameService.platforms());
    } catch {
      setPlatforms([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gameService.list(filters);
      setItems(data.items);
      setQueuePreview(data.queuePreview ?? []);
      setCount(data.count);
      setPageCount(data.pageCount);
      if ((filters.page ?? 1) > data.pageCount) {
        setFilters((current) => ({ ...current, page: data.pageCount }));
      }
    } catch {
      setError("Não foi possível carregar os jogos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadPlatforms();
  }, [loadPlatforms]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(payload: GamePayload) {
    await gameService.create(payload);
    await Promise.all([load(), loadPlatforms()]);
  }

  async function update(id: string, payload: Partial<GamePayload>) {
    await gameService.update(id, payload);
    await Promise.all([load(), loadPlatforms()]);
  }

  async function remove(id: string) {
    await gameService.remove(id);
    await Promise.all([load(), loadPlatforms()]);
  }

  function resetPage(next: GameFilters): GameFilters {
    return { ...next, page: 1 };
  }

  function setQuery(q: string) {
    setFilters((current) => resetPage({ ...current, q }));
  }

  function setStatus(status: GameStatus | "") {
    setFilters((current) => resetPage({ ...current, status }));
  }

  function setPlatform(platform: string) {
    setFilters((current) => resetPage({ ...current, platform }));
  }

  function setSort(sort: GameSort) {
    setFilters((current) => resetPage({ ...current, sort }));
  }

  function setInvert(invert: boolean) {
    setFilters((current) => resetPage({ ...current, invert }));
  }

  function setPage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  return {
    items,
    queuePreview,
    loading,
    error,
    filters,
    platforms,
    count,
    page: filters.page ?? 1,
    pageCount,
    load,
    create,
    update,
    remove,
    setQuery,
    setStatus,
    setPlatform,
    setSort,
    setInvert,
    setPage,
  };
}
