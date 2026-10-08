import { useCallback, useEffect, useState } from "react";
import type { Project, ProjectStatus } from "../../../types/models";
import { projectService, type ProjectFilters, type ProjectPayload } from "../../../services/projectService";

export function useProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    q: "",
    status: "",
    published: "",
    monetize: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await projectService.list(filters));
    } catch {
      setError("Não foi possível carregar os projetos.");
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

  async function create(payload: ProjectPayload) {
    await projectService.create(payload);
    await load();
  }

  async function update(id: string, payload: Partial<ProjectPayload>) {
    await projectService.update(id, payload);
    await load();
  }

  async function remove(id: string) {
    await projectService.remove(id);
    await load();
  }

  function setQuery(q: string) {
    setFilters((current) => ({ ...current, q }));
  }

  function setStatus(status: ProjectStatus | "") {
    setFilters((current) => ({ ...current, status }));
  }

  function setPublished(published: boolean | "") {
    setFilters((current) => ({ ...current, published }));
  }

  function setMonetize(monetize: boolean | "") {
    setFilters((current) => ({ ...current, monetize }));
  }

  return {
    items,
    loading,
    error,
    filters,
    setQuery,
    setStatus,
    setPublished,
    setMonetize,
    load,
    create,
    update,
    remove,
  };
}
