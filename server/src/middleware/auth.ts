import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { hasOwnerSession, hasValidSession } from "../lib/session.js";
import { isAccessGateEnabled } from "../services/accessGate.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (hasValidSession(req)) {
    next();
    return;
  }
  try {
    if (!(await isAccessGateEnabled())) {
      next();
      return;
    }
    res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    next(error);
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (!hasOwnerSession(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
