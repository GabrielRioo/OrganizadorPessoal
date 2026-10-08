import { Router } from "express";
import type { BuyPriority, BuyStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryString } from "../lib/http.js";
import { buyItemCreateSchema, buyItemUpdateSchema } from "../validation/schemas.js";

const buyStatuses = new Set<BuyStatus>(["WANT", "RESEARCHING", "WAITING_DEAL", "BOUGHT", "DROPPED"]);
const buyPriorities = new Set<BuyPriority>(["HIGH", "MEDIUM", "LOW"]);

type BuyLink = { url: string; label: string | null };

function parseLinks(value: Prisma.JsonValue): BuyLink[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }
    const url = "url" in entry && typeof entry.url === "string" ? entry.url : "";
    if (!url) {
      return [];
    }
    const label = "label" in entry && typeof entry.label === "string" ? entry.label : null;
    return [{ url, label }];
  });
}

function serialize(item: {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  currentPrice: Prisma.Decimal | null;
  targetPrice: Prisma.Decimal | null;
  currency: string;
  quantity: number;
  priority: BuyPriority;
  status: BuyStatus;
  links: Prisma.JsonValue;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    currentPrice: item.currentPrice != null ? Number(item.currentPrice) : null,
    targetPrice: item.targetPrice != null ? Number(item.targetPrice) : null,
    currency: item.currency,
    quantity: item.quantity,
    priority: item.priority,
    status: item.status,
    links: parseLinks(item.links),
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const buyItemsRouter = Router();

buyItemsRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const category = queryString(req, "category");
    const statusParam = queryString(req, "status");
    const priorityParam = queryString(req, "priority");
    const status =
      statusParam && buyStatuses.has(statusParam as BuyStatus) ? (statusParam as BuyStatus) : undefined;
    const priority =
      priorityParam && buyPriorities.has(priorityParam as BuyPriority)
        ? (priorityParam as BuyPriority)
        : undefined;

    const where: Prisma.BuyItemWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    };

    const statusOrder: Record<BuyStatus, number> = {
      WANT: 0,
      RESEARCHING: 1,
      WAITING_DEAL: 2,
      BOUGHT: 3,
      DROPPED: 4,
    };
    const priorityOrder: Record<BuyPriority, number> = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2,
    };

    const items = await prisma.buyItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    items.sort((left, right) => {
      const byStatus = statusOrder[left.status] - statusOrder[right.status];
      if (byStatus !== 0) {
        return byStatus;
      }
      const byPriority = priorityOrder[left.priority] - priorityOrder[right.priority];
      if (byPriority !== 0) {
        return byPriority;
      }
      return right.updatedAt.getTime() - left.updatedAt.getTime();
    });
    res.json(items.map(serialize));
  } catch (error) {
    next(error);
  }
});

buyItemsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(buyItemCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.buyItem.create({
      data: {
        ...body,
        links: body.links ?? [],
      },
    });
    res.status(201).json(serialize(item));
  } catch (error) {
    next(error);
  }
});

buyItemsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(buyItemUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.buyItem.update({
      where: { id: req.params.id },
      data: {
        ...body,
        ...(body.links ? { links: body.links } : {}),
      },
    });
    res.json(serialize(item));
  } catch (error) {
    next(error);
  }
});

buyItemsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.buyItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
