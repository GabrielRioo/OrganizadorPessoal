import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { env, isProduction } from "../env.js";

export const SESSION_COOKIE = "organizer_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionRole = "owner" | "guest";

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

function signRole(role: SessionRole): string {
  const signature = crypto.createHmac("sha256", env.sessionSecret).update(role).digest("hex");
  return `${role}.${signature}`;
}

function parseRole(value: string | undefined): SessionRole | null {
  if (!value) {
    return null;
  }
  if (value === "authenticated") {
    return "owner";
  }
  const separator = value.indexOf(".");
  if (separator <= 0) {
    return null;
  }
  const role = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!ROLES.has(role as SessionRole) || !signature) {
    return null;
  }
  const expected = crypto.createHmac("sha256", env.sessionSecret).update(role).digest("hex");
  const digestA = Buffer.from(signature, "utf8");
  const digestB = Buffer.from(expected, "utf8");
  if (digestA.length !== digestB.length || !crypto.timingSafeEqual(digestA, digestB)) {
    return null;
  }
  return role as SessionRole;
}

export function setSessionCookie(res: Response, role: SessionRole): void {
  res.cookie(SESSION_COOKIE, signRole(role), cookieOptions());
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
  const signed = req.signedCookies?.[SESSION_COOKIE];
  if (typeof signed === "string") {
    return signed;
  }
  const raw = req.cookies?.[SESSION_COOKIE];
  return typeof raw === "string" ? raw : undefined;
}

export function hasOwnerSession(req: Request): boolean {
  return parseRole(sessionValue(req)) === "owner";
}

export function hasValidSession(req: Request): boolean {
  return parseRole(sessionValue(req)) !== null;
}

export function sessionRole(req: Request): SessionRole | null {
  return parseRole(sessionValue(req));
}
