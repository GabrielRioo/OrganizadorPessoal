import type { Request, Response } from "express";
import { userIdOf } from "./session.js";

export function ownedBy(req: Request): { userId: string } {
  return { userId: userIdOf(req) };
}

export async function requireOwnedId(
  req: Request,
  res: Response,
  lookup: (id: string, userId: string) => Promise<{ id: string } | null>,
): Promise<string | null> {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) {
    res.status(400).json({ error: "Invalid input" });
    return null;
  }
  const row = await lookup(id, userIdOf(req));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return null;
  }
  return row.id;
}
