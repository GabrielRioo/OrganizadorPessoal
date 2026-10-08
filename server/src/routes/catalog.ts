import { Router } from "express";
import type { MediaKind } from "@prisma/client";
import { env } from "../env.js";
import { queryString } from "../lib/http.js";
import { searchGameCatalog } from "../services/gameCatalog.js";
import { searchMedia } from "../services/tmdbCatalog.js";

const kinds = new Set<MediaKind>(["MOVIE", "SERIES", "ANIME"]);

export const catalogRouter = Router();

catalogRouter.get("/games", async (req, res, next) => {
  try {
    const q = queryString(req, "q") ?? "";
    if (q.length < 2) {
      res.json({ available: true, results: [] });
      return;
    }
    const results = await searchGameCatalog(q.slice(0, 80));
    res.json({ available: true, results });
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/media", async (req, res, next) => {
  try {
    const q = queryString(req, "q") ?? "";
    const kindParam = queryString(req, "kind");
    const kind = kindParam && kinds.has(kindParam as MediaKind) ? (kindParam as MediaKind) : "MOVIE";
    if (q.length < 2) {
      res.json({ available: Boolean(env.tmdbApiKey), results: [] });
      return;
    }
    if (!env.tmdbApiKey) {
      res.json({ available: false, results: [] });
      return;
    }
    const results = await searchMedia(q.slice(0, 80), kind);
    res.json({ available: true, results });
  } catch (error) {
    next(error);
  }
});
