import type { Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

export function parseBody<T>(schema: ZodType<T>, req: Request, res: Response): T | null {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: flattenZod(parsed.error) });
    return null;
  }
  return parsed.data;
}

export function flattenZod(error: ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}

export function queryString(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function queryBool(req: Request, key: string): boolean | undefined {
  const value = queryString(req, key);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}
