import { Router } from "express";
import type { MediaKind, MediaStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryString } from "../lib/http.js";
import { ownedBy, requireOwnedId } from "../lib/owned.js";
import { enrichMediaCovers } from "../services/coverEnrichment.js";
import { mediaCreateSchema, mediaUpdateSchema } from "../validation/schemas.js";

const kinds = new Set<MediaKind>(["MOVIE", "SERIES", "ANIME"]);
const statuses = new Set<MediaStatus>([
  "WATCHLIST",
  "WATCHING",
  "PAUSED",
  "WAITING",
  "WATCHED",
]);

export const mediaRouter = Router();

mediaRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const kindParam = queryString(req, "kind");
    const statusParam = queryString(req, "status");
    const kind = kindParam && kinds.has(kindParam as MediaKind)
      ? (kindParam as MediaKind)
      : undefined;
    const status = statusParam && statuses.has(statusParam as MediaStatus)
      ? (statusParam as MediaStatus)
      : undefined;

    const where: Prisma.MediaWhereInput = {
      ...ownedBy(req),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    };

    const items = await prisma.media.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(await enrichMediaCovers(items));
  } catch (error) {
    next(error);
  }
});

mediaRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(mediaCreateSchema, req, res);
    if (!body) {
      return;
    }
    const created = await prisma.media.create({ data: { ...body, ...ownedBy(req) } });
    const [item] = await enrichMediaCovers([created]);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

mediaRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(mediaUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.media.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    const item = await prisma.media.update({
      where: { id },
      data: body,
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

mediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.media.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    await prisma.media.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
