import { Router } from "express";
import { env } from "../env.js";
import { parseBody } from "../lib/http.js";
import { verifyPassword } from "../lib/passwordHash.js";
import {
  clearSessionCookie,
  passwordsMatch,
  readSession,
  setSessionCookie,
} from "../lib/session.js";
import { prisma } from "../lib/prisma.js";
import { ensureOwnerUser } from "../services/users.js";
import { loginSchema } from "../validation/schemas.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = parseBody(loginSchema, req, res);
    if (!body) {
      return;
    }

    if (passwordsMatch(body.password, env.appPassword)) {
      const owner = await ensureOwnerUser();
      setSessionCookie(res, { userId: owner.id, role: "owner" });
      res.json({ ok: true, role: "owner" });
      return;
    }

    const stored = await prisma.accessPassword.findMany({
      where: { revokedAt: null },
      select: { passwordHash: true, userId: true },
    });
    for (const entry of stored) {
      if (await verifyPassword(body.password, entry.passwordHash)) {
        setSessionCookie(res, { userId: entry.userId, role: "guest" });
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

authRouter.get("/me", (req, res) => {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    authenticated: true,
    loginRequired: true,
    role: session.role,
  });
});
