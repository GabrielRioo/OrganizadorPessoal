import { Router } from "express";
import { env } from "../env.js";
import { parseBody } from "../lib/http.js";
import { verifyPassword } from "../lib/passwordHash.js";
import {
  clearSessionCookie,
  hasValidSession,
  passwordsMatch,
  sessionRole,
  setSessionCookie,
} from "../lib/session.js";
import { prisma } from "../lib/prisma.js";
import { isAccessGateEnabled } from "../services/accessGate.js";
import { loginSchema } from "../validation/schemas.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = parseBody(loginSchema, req, res);
    if (!body) {
      return;
    }

    if (passwordsMatch(body.password, env.appPassword)) {
      setSessionCookie(res, "owner");
      res.json({ ok: true, role: "owner" });
      return;
    }

    const stored = await prisma.accessPassword.findMany({
      where: { revokedAt: null },
      select: { passwordHash: true },
    });
    for (const entry of stored) {
      if (await verifyPassword(body.password, entry.passwordHash)) {
        setSessionCookie(res, "guest");
        res.json({ ok: true, role: "guest" });
        return;
      }
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const loginRequired = await isAccessGateEnabled();
    const role = sessionRole(req);
    if (role || !loginRequired) {
      res.json({
        authenticated: true,
        loginRequired,
        role: role ?? "open",
      });
      return;
    }
    res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    next(error);
  }
});
