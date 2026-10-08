import { api } from "./api";

export type AuthRole = "owner" | "guest" | "open";

export type AuthMe = {
  authenticated: boolean;
  loginRequired: boolean;
  role: AuthRole;
};

export const authService = {
  login: (password: string) => api.post<{ ok: boolean; role: AuthRole }>("/api/auth/login", { password }),
  logout: () => api.post<{ ok: boolean }>("/api/auth/logout", {}),
  me: () => api.get<AuthMe>("/api/auth/me"),
};
