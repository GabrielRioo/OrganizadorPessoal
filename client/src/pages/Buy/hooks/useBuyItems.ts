import { useCallback, useEffect, useState } from "react";
import type { BuyItem, BuyPriority, BuyStatus } from "../../../types/models";
import { buyService, type BuyItemFilters, type BuyItemPayload } from "../../../services/buyService";

export function useBuyItems() {
  const [items, setItems] = useState<BuyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BuyItemFilters>({
    q: "",
    status: "",
    priority: "",
    category: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await buyService.list(filters));
    } catch {
      setError("Não foi possível carregar a lista de compras.");
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

  async function create(payload: BuyItemPayload) {
    await buyService.create(payload);
    await load();
  }

  async function update(id: string, payload: Partial<BuyItemPayload>) {
    await buyService.update(id, payload);
    await load();
  }

  async function remove(id: string) {
    await buyService.remove(id);
    await load();
  }

  function setQuery(q: string) {
    setFilters((current) => ({ ...current, q }));
  }

  function setStatus(status: BuyStatus | "") {
    setFilters((current) => ({ ...current, status }));
  }

  function setPriority(priority: BuyPriority | "") {
    setFilters((current) => ({ ...current, priority }));
  }

  function setCategory(category: string) {
    setFilters((current) => ({ ...current, category }));
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
    setQuery,
    setStatus,
    setPriority,
    setCategory,
  };
}
