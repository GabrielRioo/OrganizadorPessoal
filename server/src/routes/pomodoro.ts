import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseBody } from "../lib/http.js";
import { pomodoroCreateSchema } from "../validation/schemas.js";

export const pomodoroRouter = Router();

pomodoroRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.pomodoroSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

pomodoroRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(pomodoroCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.pomodoroSession.create({
      data: {
        startedAt: new Date(body.startedAt),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        durationMin: body.durationMin,
        label: body.label,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});
