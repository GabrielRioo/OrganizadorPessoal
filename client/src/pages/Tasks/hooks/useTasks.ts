import { useCallback, useEffect, useState } from "react";
import type { Task, TaskKind, TaskStatus } from "../../../types/models";
import { taskService, type TaskPayload } from "../../../services/taskService";

export function useTasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQuery] = useState("");
  const [kind, setKind] = useState<TaskKind | "">("");
  const [status, setStatus] = useState<TaskStatus | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await taskService.list(q, kind, status));
    } catch {
      setError("Não foi possível carregar tarefas e ideias.");
    } finally {
      setLoading(false);
    }
  }, [q, kind, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(payload: TaskPayload) {
    const item = await taskService.create(payload);
    setItems((current) => [item, ...current]);
  }

  async function update(id: string, payload: Partial<TaskPayload>) {
    const item = await taskService.update(id, payload);
    setItems((current) => current.map((entry) => (entry.id === id ? item : entry)));
  }

  async function remove(id: string) {
    await taskService.remove(id);
    setItems((current) => current.filter((entry) => entry.id !== id));
  }

  return {
    items,
    loading,
    error,
    q,
    kind,
    status,
    setQuery,
    setKind,
    setStatus,
    load,
    create,
    update,
    remove,
  };
}
