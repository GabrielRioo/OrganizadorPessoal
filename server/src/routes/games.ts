import { Router } from "express";
import type { GameStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryBool, queryString } from "../lib/http.js";
import { ownedBy, requireOwnedId } from "../lib/owned.js";
import { enrichGameCovers } from "../services/coverEnrichment.js";
import { gameCreateSchema, gameUpdateSchema } from "../validation/schemas.js";

const gameStatuses = new Set<GameStatus>([
  "WISHLIST",
  "BACKLOG",
  "PLAYING",
  "PAUSED",
  "PLAYED",
  "ABANDONED",
  "ONLINE",
  "CASUAL",
  "EVENTUAL",
]);

const gameSorts = {
  queue: [{ queuePosition: "asc" }, { updatedAt: "desc" }],
  updated: [{ updatedAt: "desc" }],
  title: [{ title: "asc" }],
  hours: [{ playtimeHours: { sort: "desc", nulls: "last" } }, { title: "asc" }],
  added: [{ createdAt: "desc" }],
} as const satisfies Record<string, Prisma.GameOrderByWithRelationInput[]>;

type GameSort = keyof typeof gameSorts;

function invertDirection(value: Prisma.SortOrder): Prisma.SortOrder {
  return value === "asc" ? "desc" : "asc";
}

function applySortDirection(
  clauses: Prisma.GameOrderByWithRelationInput[],
  invert: boolean,
): Prisma.GameOrderByWithRelationInput[] {
  if (!invert) {
    return clauses;
  }
  return clauses.map((clause) => {
    const next: Prisma.GameOrderByWithRelationInput = { ...clause };
    if (next.queuePosition === "asc" || next.queuePosition === "desc") {
      next.queuePosition = invertDirection(next.queuePosition);
    }
    if (next.updatedAt === "asc" || next.updatedAt === "desc") {
      next.updatedAt = invertDirection(next.updatedAt);
    }
    if (next.title === "asc" || next.title === "desc") {
      next.title = invertDirection(next.title);
    }
    if (next.createdAt === "asc" || next.createdAt === "desc") {
      next.createdAt = invertDirection(next.createdAt);
    }
    if (next.playtimeHours && typeof next.playtimeHours === "object" && "sort" in next.playtimeHours) {
      next.playtimeHours = {
        ...next.playtimeHours,
        sort: invertDirection(next.playtimeHours.sort ?? "desc"),
      };
    }
    return next;
  });
}

export const gamesRouter = Router();

gamesRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const platform = queryString(req, "platform");
    const statusParam = queryString(req, "status");
    const status = statusParam && gameStatuses.has(statusParam as GameStatus)
      ? (statusParam as GameStatus)
      : undefined;
    const sortParam = queryString(req, "sort");
    const sort: GameSort = sortParam && sortParam in gameSorts ? (sortParam as GameSort) : "queue";
    const invert = queryBool(req, "invert") === true;

    const where: Prisma.GameWhereInput = {
      ...ownedBy(req),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(platform ? { platform: { equals: platform, mode: "insensitive" } } : {}),
      ...(status ? { status } : {}),
    };

    const games = await prisma.game.findMany({
      where,
      orderBy: applySortDirection([...gameSorts[sort]], invert),
    });
    res.json(await enrichGameCovers(games));
  } catch (error) {
    next(error);
  }
});

gamesRouter.get("/platforms", async (req, res, next) => {
  try {
    const rows = await prisma.game.findMany({
      where: ownedBy(req),
      distinct: ["platform"],
      select: { platform: true },
      orderBy: { platform: "asc" },
    });
    res.json(rows.map((row) => row.platform).filter((value) => value.trim().length > 0));
  } catch (error) {
    next(error);
  }
});

gamesRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(gameCreateSchema, req, res);
    if (!body) {
      return;
    }
    const created = await prisma.game.create({ data: { ...body, ...ownedBy(req) } });
    const [game] = await enrichGameCovers([created]);
    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
});

gamesRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(gameUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.game.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    const game = await prisma.game.update({
      where: { id },
      data: body,
    });
    res.json(game);
  } catch (error) {
    next(error);
  }
});

gamesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.game.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    await prisma.game.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
