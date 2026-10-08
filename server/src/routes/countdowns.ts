import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseBody } from "../lib/http.js";
import { countdownCreateSchema, countdownUpdateSchema } from "../validation/schemas.js";

export const countdownsRouter = Router();

countdownsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.countdown.findMany({
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
    const item = await prisma.countdown.update({
      where: { id: req.params.id },
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
    await prisma.countdown.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
