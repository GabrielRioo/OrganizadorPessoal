import { useCallback, useEffect, useState } from "react";
import type { Travel, TravelStatus } from "../../../types/models";
import { travelService, type TravelPayload } from "../../../services/travelService";

export function useTravels() {
  const [items, setItems] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQuery] = useState("");
  const [status, setStatus] = useState<TravelStatus | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await travelService.list(q, status));
    } catch {
      setError("Não foi possível carregar as viagens.");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(payload: TravelPayload) {
    await travelService.create(payload);
    await load();
  }

  async function update(id: string, payload: Partial<TravelPayload>) {
    await travelService.update(id, payload);
    await load();
  }

  async function remove(id: string) {
    await travelService.remove(id);
    await load();
  }

  return { items, loading, error, q, status, setQuery, setStatus, load, create, update, remove };
}
