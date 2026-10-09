import { Router } from "express";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { parseBody, queryBool, queryString } from "../lib/http.js";
import { ownedBy, requireOwnedId } from "../lib/owned.js";
import { projectCreateSchema, projectUpdateSchema } from "../validation/schemas.js";

const statuses = new Set<ProjectStatus>(["PLANNED", "IN_PROGRESS", "PAUSED", "DONE"]);

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res, next) => {
  try {
    const q = queryString(req, "q");
    const statusParam = queryString(req, "status");
    const status = statusParam && statuses.has(statusParam as ProjectStatus)
      ? (statusParam as ProjectStatus)
      : undefined;
    const published = queryBool(req, "published");
    const monetize = queryBool(req, "monetize");

    const where: Prisma.ProjectWhereInput = {
      ...ownedBy(req),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(status ? { status } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(monetize !== undefined ? { monetize } : {}),
    };

    const items = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(projectCreateSchema, req, res);
    if (!body) {
      return;
    }
    const item = await prisma.project.create({
      data: {
        ...body,
        ...ownedBy(req),
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(projectUpdateSchema, req, res);
    if (!body) {
      return;
    }
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.project.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    const item = await prisma.project.update({
      where: { id },
      data: {
        ...body,
        deadline:
          body.deadline === undefined
            ? undefined
            : body.deadline
              ? new Date(body.deadline)
              : null,
      },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = await requireOwnedId(req, res, (rowId, userId) =>
      prisma.project.findFirst({ where: { id: rowId, userId }, select: { id: true } }),
    );
    if (!id) {
      return;
    }
    await prisma.project.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
