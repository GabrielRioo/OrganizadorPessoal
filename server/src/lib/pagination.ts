import type { Request } from "express";
import { queryInt } from "./http.js";

const defaultPageSize = 24;
const maxPageSize = 60;

export type PageParams = {
  page: number;
  pageSize: number;
  skip: number;
};

export function parsePageParams(req: Request): PageParams {
  const rawPage = queryInt(req, "page") ?? 1;
  const rawPageSize = queryInt(req, "pageSize") ?? defaultPageSize;
  const page = Math.max(1, rawPage);
  const pageSize = Math.min(maxPageSize, Math.max(1, rawPageSize));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function paginatedResponse<T>(input: {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  count: number;
}) {
  return {
    items: input.items,
    total: input.total,
    page: input.page,
    pageSize: input.pageSize,
    pageCount: Math.max(1, Math.ceil(input.total / input.pageSize)),
    count: input.count,
  };
}
