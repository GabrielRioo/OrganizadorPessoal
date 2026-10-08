import type { Countdown, PomodoroSession } from "../types/models";
import { api } from "./api";

export type CountdownPayload = {
  title: string;
  targetDate: string;
  notes?: string | null;
};

export const countdownService = {
  list: () => api.get<Countdown[]>("/api/countdowns"),
  create: (payload: CountdownPayload) => api.post<Countdown>("/api/countdowns", payload),
  update: (id: string, payload: Partial<CountdownPayload>) =>
    api.patch<Countdown>(`/api/countdowns/${id}`, payload),
  remove: (id: string) => api.delete(`/api/countdowns/${id}`),
};

export type PomodoroPayload = {
  startedAt: string;
  endedAt?: string | null;
  durationMin: number;
  label?: string | null;
};

export const pomodoroService = {
  list: () => api.get<PomodoroSession[]>("/api/pomodoro-sessions"),
  create: (payload: PomodoroPayload) =>
    api.post<PomodoroSession>("/api/pomodoro-sessions", payload),
};
