import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res, next) => {
  try {
    const [doingTasks, playingGames, watchingMedia, upcomingCountdowns, recentPomodoros, wantToBuy] =
      await Promise.all([
        prisma.task.findMany({
          where: { status: "DOING" },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
        prisma.game.findMany({
          where: { status: "PLAYING" },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
        prisma.media.findMany({
          where: { status: "WATCHING" },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
        prisma.countdown.findMany({
          orderBy: { targetDate: "asc" },
          take: 5,
        }),
        prisma.pomodoroSession.findMany({
          orderBy: { startedAt: "desc" },
          take: 5,
        }),
        prisma.buyItem.findMany({
          where: {
            status: { in: ["WANT", "RESEARCHING", "WAITING_DEAL"] },
            priority: "HIGH",
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    res.json({
      doingTasks,
      playingGames,
      watchingMedia,
      upcomingCountdowns,
      recentPomodoros,
      wantToBuy: wantToBuy.map((item) => ({
        id: item.id,
        name: item.name,
        currentPrice: item.currentPrice != null ? Number(item.currentPrice) : null,
        currency: item.currency,
        status: item.status,
      })),
    });
  } catch (error) {
    next(error);
  }
});
