import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { hasOwnerSession, hasValidSession } from "../lib/session.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!hasValidSession(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
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
