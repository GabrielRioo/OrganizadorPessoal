import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseBody } from "../lib/http.js";
import { ownedBy, requireOwnedId } from "../lib/owned.js";
import { countdownCreateSchema, countdownUpdateSchema } from "../validation/schemas.js";

export const countdownsRouter = Router();

countdownsRouter.get("/", async (req, res, next) => {
  try {
    const items = await prisma.countdown.findMany({
      where: ownedBy(req),
      orderBy: { targetDate: "asc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

countdownsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(countdownCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.countdown.create({
      data: {
        ...ownedBy(req),
        title: body.title,
        targetDate: new Date(body.targetDate),
        notes: body.notes,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

countdownsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(countdownUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.countdown.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    const item = await prisma.countdown.update({
      where: { id },
      data: {
        ...body,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

countdownsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.countdown.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    await prisma.countdown.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
