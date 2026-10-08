import type { Project, ProjectStatus } from "../types/models";
import { api } from "./api";

export type ProjectPayload = {
  title: string;
  status: ProjectStatus;
  description?: string | null;
  deadline?: string | null;
  published?: boolean;
  monetize?: boolean;
};

export type ProjectFilters = {
  q?: string;
  status?: ProjectStatus | "";
  published?: boolean | "";
  monetize?: boolean | "";
};

function projectsQuery(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.published === true) params.set("published", "true");
  if (filters.published === false) params.set("published", "false");
  if (filters.monetize === true) params.set("monetize", "true");
  if (filters.monetize === false) params.set("monetize", "false");
  const query = params.toString();
  return query ? `/api/projects?${query}` : "/api/projects";
}

export const projectService = {
  list: (filters: ProjectFilters = {}) => api.get<Project[]>(projectsQuery(filters)),
  create: (payload: ProjectPayload) => api.post<Project>("/api/projects", payload),
  update: (id: string, payload: Partial<ProjectPayload>) =>
    api.patch<Project>(`/api/projects/${id}`, payload),
  remove: (id: string) => api.delete(`/api/projects/${id}`),
};
