import { Router } from "express";
import type { Prisma, TravelStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryString } from "../lib/http.js";
import { ownedBy, requireOwnedId } from "../lib/owned.js";
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
      ...ownedBy(req),
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
        ...ownedBy(req),
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
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.travel.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    const item = await prisma.travel.update({
      where: { id },
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
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.travel.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    await prisma.travel.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
