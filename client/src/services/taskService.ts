import type { Task, TaskKind, TaskStatus } from "../types/models";
import { api } from "./api";

export type TaskPayload = {
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  notes?: string | null;
};

export const taskService = {
  list: (q = "", kind: TaskKind | "" = "", status: TaskStatus | "" = "") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kind) params.set("kind", kind);
    if (status) params.set("status", status);
    const query = params.toString();
    return api.get<Task[]>(query ? `/api/tasks?${query}` : "/api/tasks");
  },
  create: (payload: TaskPayload) => api.post<Task>("/api/tasks", payload),
  update: (id: string, payload: Partial<TaskPayload>) =>
    api.patch<Task>(`/api/tasks/${id}`, payload),
  remove: (id: string) => api.delete(`/api/tasks/${id}`),
};
