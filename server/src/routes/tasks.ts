import { Router } from "express";
import type { Prisma, TaskKind, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryString } from "../lib/http.js";
import { taskCreateSchema, taskUpdateSchema } from "../validation/schemas.js";

const kinds = new Set<TaskKind>(["TASK", "IDEA"]);
const statuses = new Set<TaskStatus>(["TODO", "DOING", "DONE"]);

export const tasksRouter = Router();

tasksRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const kindParam = queryString(req, "kind");
    const statusParam = queryString(req, "status");
    const kind = kindParam && kinds.has(kindParam as TaskKind)
      ? (kindParam as TaskKind)
      : undefined;
    const status = statusParam && statuses.has(statusParam as TaskStatus)
      ? (statusParam as TaskStatus)
      : undefined;

    const where: Prisma.TaskWhereInput = {
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    };

    const items = await prisma.task.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(taskCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.task.create({ data: body });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(taskUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.task.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
