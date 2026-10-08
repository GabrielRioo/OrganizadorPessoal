import { useCallback, useEffect, useState } from "react";
import {
  accessPasswordService,
  type AccessPassword,
  type CreatedAccessPassword,
} from "../../../services/accessPasswordService";

export function useAccessPasswords(enabled: boolean) {
  const [items, setItems] = useState<AccessPassword[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await accessPasswordService.list());
    } catch {
      setError("Não foi possível carregar as senhas.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(payload: { label: string; password?: string | null }): Promise<CreatedAccessPassword> {
    const created = await accessPasswordService.create(payload);
    await load();
    return created;
  }

  async function revoke(id: string) {
    await accessPasswordService.revoke(id);
    await load();
  }

  return { items, loading, error, load, create, revoke };
}
