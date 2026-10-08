import type { Game, Media } from "@prisma/client";
import { isAllowedCoverUrl } from "../lib/coverUrl.js";
import { isCloseTitle, isSteamPortraitCover, titleScore } from "../lib/titleMatch.js";
import { prisma } from "../lib/prisma.js";
import { searchGameCatalog } from "./gameCatalog.js";
import { resolveSteamLibraryCapsules, steamAppIdFromCover } from "./steamCatalog.js";
import { searchMedia } from "./tmdbCatalog.js";

const batchSize = 3;

async function mapInBatches<T>(items: T[], mapper: (item: T) => Promise<T>): Promise<T[]> {
  const result: T[] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    const chunk = items.slice(index, index + batchSize);
    result.push(...(await Promise.all(chunk.map(mapper))));
  }
  return result;
}

function usableCover(url: string | null | undefined): string | null {
  if (!url || !isAllowedCoverUrl(url)) {
    return null;
  }
  return url;
}

function needsSteamPortrait(game: Game): boolean {
  return !isSteamPortraitCover(game.coverUrl);
}

function needsHashedCapsule(game: Game): boolean {
  return Boolean(game.coverUrl?.includes("library_600x900"));
}

export async function enrichGameCovers(games: Game[]): Promise<Game[]> {
  const hashedUpgrades = await resolveSteamLibraryCapsules(
    games.flatMap((game) => {
      if (!needsHashedCapsule(game)) {
        return [];
      }
      const appId = steamAppIdFromCover(game.coverUrl);
      return appId ? [appId] : [];
    }),
  ).catch(() => new Map<number, string>());

  return mapInBatches(games, async (game) => {
    const hashedAppId = steamAppIdFromCover(game.coverUrl);
    const hashedCover = hashedAppId ? hashedUpgrades.get(hashedAppId) : undefined;
    if (hashedCover && hashedCover !== game.coverUrl) {
      return prisma.game.update({
        where: { id: game.id },
        data: {
          coverUrl: hashedCover,
          coverCheckedAt: new Date(),
          coverSource: "steam_library",
        },
      });
    }
    if (!needsSteamPortrait(game)) {
      return game;
    }
    try {
      const cleaned = game.title.replace(/[™®©]/gu, " ").replace(/\s+/gu, " ").trim();
      const queries = [cleaned, cleaned.replace(/\s+\d+$/u, "").trim()].filter(
        (value, index, all) => value.length >= 2 && all.indexOf(value) === index,
      );
      const hits = (await Promise.all(queries.map((query) => searchGameCatalog(query)))).flat();
      const steamHits = hits.filter((hit) => isSteamPortraitCover(hit.coverUrl));
      const rankedSteam = [...steamHits].sort(
        (left, right) => titleScore(game.title, right.title) - titleScore(game.title, left.title),
      );
      const bestSteam = rankedSteam[0];
      const match =
        bestSteam && titleScore(game.title, bestSteam.title) >= 50
          ? bestSteam
          : hits.find((hit) => hit.coverUrl && isCloseTitle(game.title, hit.title));
      const coverUrl = usableCover(match?.coverUrl) ?? game.coverUrl;
      const source = isSteamPortraitCover(coverUrl) ? "steam_library" : coverUrl ? "rawg" : "missing";
      return prisma.game.update({
        where: { id: game.id },
        data: {
          coverUrl,
          playtimeHours: game.playtimeHours ?? match?.playtimeHours ?? undefined,
          coverCheckedAt: new Date(),
          coverSource: source,
        },
      });
    } catch {
      return game;
    }
  });
}

export async function enrichMediaCovers(items: Media[]): Promise<Media[]> {
  return mapInBatches(items, async (item) => {
    if (item.coverUrl || item.coverCheckedAt) {
      return item;
    }
    try {
      const hits = await searchMedia(item.title, item.kind);
      const match =
        hits.find((hit) => hit.coverUrl && isCloseTitle(item.title, hit.title)) ??
        hits.find((hit) => Boolean(hit.coverUrl));
      const coverUrl = usableCover(match?.coverUrl);
      return prisma.media.update({
        where: { id: item.id },
        data: {
          coverUrl,
          year: item.year ?? match?.year ?? undefined,
          genre: item.genre ?? match?.genre ?? undefined,
          coverCheckedAt: new Date(),
        },
      });
    } catch {
      return item;
    }
  });
}
