import { Router } from "express";
import type { Prisma, TravelStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryString } from "../lib/http.js";
import { travelCreateSchema, travelUpdateSchema } from "../validation/schemas.js";

const statuses = new Set<TravelStatus>(["VISITED", "PLANNING"]);

export const travelsRouter = Router();

travelsRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const statusParam = queryString(req, "status");
    const status = statusParam && statuses.has(statusParam as TravelStatus)
      ? (statusParam as TravelStatus)
      : undefined;

    const where: Prisma.TravelWhereInput = {
      ...(q
        ? {
            OR: [
              { place: { contains: q, mode: "insensitive" } },
              { country: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const items = await prisma.travel.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

travelsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(travelCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.travel.create({
      data: {
        ...body,
        visitedAt: body.visitedAt ? new Date(body.visitedAt) : null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

travelsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(travelUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.travel.update({
      where: { id: req.params.id },
      data: {
        ...body,
        visitedAt:
          body.visitedAt === undefined
            ? undefined
            : body.visitedAt
              ? new Date(body.visitedAt)
              : null,
      },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

travelsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.travel.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
