import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { env, isProduction } from "../env.js";

export const SESSION_COOKIE = "organizer_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionRole = "owner" | "guest";

export type SessionPayload = {
  userId: string;
  role: SessionRole;
};

const ROLES = new Set<SessionRole>(["owner", "guest"]);

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: MAX_AGE_MS,
  };
}

export function passwordsMatch(input: string, expected: string): boolean {
  const digestA = crypto.createHmac("sha256", env.sessionSecret).update(input).digest();
  const digestB = crypto.createHmac("sha256", env.sessionSecret).update(expected).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function signPayload(payload: SessionPayload): string {
  const body = `v1.${payload.userId}.${payload.role}`;
  const signature = crypto.createHmac("sha256", env.sessionSecret).update(body).digest("hex");
  return `${body}.${signature}`;
}

function parseSession(value: string | undefined): SessionPayload | null {
  if (!value) {
    return null;
  }
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    return null;
  }
  const [, userId, role, signature] = parts;
  if (!userId || !ROLES.has(role as SessionRole) || !signature) {
    return null;
  }
  const body = `v1.${userId}.${role}`;
  const expected = crypto.createHmac("sha256", env.sessionSecret).update(body).digest("hex");
  const digestA = Buffer.from(signature, "utf8");
  const digestB = Buffer.from(expected, "utf8");
  if (digestA.length !== digestB.length || !crypto.timingSafeEqual(digestA, digestB)) {
    return null;
  }
  return { userId, role: role as SessionRole };
}

export function setSessionCookie(res: Response, payload: SessionPayload): void {
  res.cookie(SESSION_COOKIE, signPayload(payload), cookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  });
}

function sessionValue(req: Request): string | undefined {
  const raw = req.cookies?.[SESSION_COOKIE];
  return typeof raw === "string" ? raw : undefined;
}

export function readSession(req: Request): SessionPayload | null {
  return parseSession(sessionValue(req));
}

export function hasOwnerSession(req: Request): boolean {
  return readSession(req)?.role === "owner";
}

export function hasValidSession(req: Request): boolean {
  return readSession(req) !== null;
}

export function sessionRole(req: Request): SessionRole | null {
  return readSession(req)?.role ?? null;
}

export function userIdOf(req: Request): string {
  const userId = req.auth?.userId ?? readSession(req)?.userId;
  if (!userId) {
    throw new Error("Authenticated request is missing user id");
  }
  return userId;
}
