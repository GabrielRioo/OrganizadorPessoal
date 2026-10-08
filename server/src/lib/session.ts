import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { env, isProduction } from "../env.js";

export const SESSION_COOKIE = "organizer_session";
const SESSION_OWNER = "owner";
const SESSION_GUEST = "guest";
const SESSION_LEGACY = "authenticated";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionRole = "owner" | "guest";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    signed: true,
    path: "/",
    maxAge: MAX_AGE_MS,
  };
}

export function passwordsMatch(input: string, expected: string): boolean {
  const digestA = crypto.createHmac("sha256", env.sessionSecret).update(input).digest();
  const digestB = crypto.createHmac("sha256", env.sessionSecret).update(expected).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function setSessionCookie(res: Response, role: SessionRole): void {
  res.cookie(SESSION_COOKIE, role, cookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    signed: true,
    path: "/",
  });
}

function sessionValue(req: Request): string | undefined {
  const value = req.signedCookies?.[SESSION_COOKIE];
  return typeof value === "string" ? value : undefined;
}

export function hasOwnerSession(req: Request): boolean {
  const value = sessionValue(req);
  return value === SESSION_OWNER || value === SESSION_LEGACY;
}

export function hasValidSession(req: Request): boolean {
  const value = sessionValue(req);
  return value === SESSION_OWNER || value === SESSION_GUEST || value === SESSION_LEGACY;
}

export function sessionRole(req: Request): SessionRole | null {
  if (hasOwnerSession(req)) {
    return "owner";
  }
  if (hasValidSession(req)) {
    return "guest";
  }
  return null;
}
