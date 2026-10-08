import { normalizeTitle, titleScore } from "../lib/titleMatch.js";
import { searchGames, type GameCatalogHit } from "./rawgCatalog.js";
import { searchSteamGames } from "./steamCatalog.js";

function preferHit(current: GameCatalogHit, next: GameCatalogHit): GameCatalogHit {
  const currentSteam = Boolean(
    current.coverUrl?.includes("library_600x900") || current.coverUrl?.includes("library_capsule"),
  );
  const nextSteam = Boolean(
    next.coverUrl?.includes("library_600x900") || next.coverUrl?.includes("library_capsule"),
  );
  if (nextSteam && !currentSteam) {
    return {
      ...next,
      playtimeHours: next.playtimeHours ?? current.playtimeHours,
    };
  }
  if (currentSteam && !nextSteam) {
    return {
      ...current,
      playtimeHours: current.playtimeHours ?? next.playtimeHours,
    };
  }
  return {
    ...current,
    playtimeHours: current.playtimeHours ?? next.playtimeHours,
    coverUrl: current.coverUrl ?? next.coverUrl,
  };
}

export async function searchGameCatalog(query: string): Promise<GameCatalogHit[]> {
  const [steam, rawg] = await Promise.all([
    searchSteamGames(query).catch(() => []),
    searchGames(query).catch(() => []),
  ]);

  const merged = new Map<string, GameCatalogHit>();
  for (const hit of [...steam, ...rawg]) {
    const key = normalizeTitle(hit.title);
    const current = merged.get(key);
    merged.set(key, current ? preferHit(current, hit) : hit);
  }

  return [...merged.values()]
    .sort((left, right) => titleScore(query, right.title) - titleScore(query, left.title))
    .slice(0, 12);
}
