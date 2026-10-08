import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseBody } from "../lib/http.js";
import { generateAccessPassword, hashPassword } from "../lib/passwordHash.js";
import { accessPasswordCreateSchema } from "../validation/schemas.js";

const publicFields = {
  id: true,
  label: true,
  createdAt: true,
  revokedAt: true,
} as const;

export const accessPasswordsRouter = Router();

accessPasswordsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.accessPassword.findMany({
      where: { revokedAt: null },
      select: publicFields,
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

accessPasswordsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(accessPasswordCreateSchema, req, res);
    if (!body) {
      return;
    }
    const password = body.password?.trim() || generateAccessPassword();
    const created = await prisma.accessPassword.create({
      data: {
        label: body.label,
        passwordHash: await hashPassword(password),
      },
      select: publicFields,
    });
    res.status(201).json({ ...created, password });
  } catch (error) {
    next(error);
  }
});

accessPasswordsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.accessPassword.update({
      where: { id: req.params.id },
      data: { revokedAt: new Date() },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
