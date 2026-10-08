import { api } from "./api";

export type AccessPassword = {
  id: string;
  label: string;
  createdAt: string;
  revokedAt: string | null;
};

export type CreatedAccessPassword = AccessPassword & {
  password: string;
};

export const accessPasswordService = {
  list: () => api.get<AccessPassword[]>("/api/access-passwords"),
  create: (payload: { label: string; password?: string | null }) =>
    api.post<CreatedAccessPassword>("/api/access-passwords", payload),
  revoke: (id: string) => api.delete(`/api/access-passwords/${id}`),
};
