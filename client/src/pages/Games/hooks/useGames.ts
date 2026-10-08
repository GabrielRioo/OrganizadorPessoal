import { useCallback, useEffect, useState } from "react";
import type { Game, GameStatus } from "../../../types/models";
import { gameService, type GameFilters, type GamePayload, type GameSort } from "../../../services/gameService";

export function useGames() {
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [filters, setFilters] = useState<GameFilters>({
    q: "",
    status: "",
    platform: "",
    sort: "queue",
    invert: false,
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
      setItems(data);
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

  function setQuery(q: string) {
    setFilters((current) => ({ ...current, q }));
  }

  function setStatus(status: GameStatus | "") {
    setFilters((current) => ({ ...current, status }));
  }

  function setPlatform(platform: string) {
    setFilters((current) => ({ ...current, platform }));
  }

  function setSort(sort: GameSort) {
    setFilters((current) => ({ ...current, sort }));
  }

  function setInvert(invert: boolean) {
    setFilters((current) => ({ ...current, invert }));
  }

  return {
    items,
    loading,
    error,
    filters,
    platforms,
    load,
    create,
    update,
    remove,
    setQuery,
    setStatus,
    setPlatform,
    setSort,
    setInvert,
  };
}
