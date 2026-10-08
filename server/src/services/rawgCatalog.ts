import { env } from "../env.js";
import { fetchCatalogJson } from "../lib/catalogHttp.js";

export type GameCatalogHit = {
  title: string;
  coverUrl: string | null;
  playtimeHours: number | null;
  platform: string | null;
  year: number | null;
};

type RawgGame = {
  name?: unknown;
  background_image?: unknown;
  playtime?: unknown;
  released?: unknown;
  parent_platforms?: Array<{ platform?: { name?: unknown } }>;
};

type RawgSearch = {
  results?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asPositiveInt(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function yearFromDate(value: unknown): number | null {
  const text = asString(value);
  if (!text) {
    return null;
  }
  const year = Number(text.slice(0, 4));
  return year >= 1970 && year <= 2100 ? year : null;
}

export async function searchGames(query: string): Promise<GameCatalogHit[]> {
  if (!env.rawgApiKey) {
    return [];
  }
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", env.rawgApiKey);
  url.searchParams.set("search", query);
  url.searchParams.set("page_size", "8");
  url.searchParams.set("search_precise", "true");

  const payload = (await fetchCatalogJson(url)) as RawgSearch;
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results.flatMap((item): GameCatalogHit[] => {
    const game = item as RawgGame;
    const title = asString(game.name);
    if (!title) {
      return [];
    }
    const cover = asString(game.background_image);
    const platforms = (game.parent_platforms ?? [])
      .map((entry) => asString(entry.platform?.name))
      .filter((name): name is string => Boolean(name));
    return [
      {
        title,
        coverUrl: cover,
        playtimeHours: asPositiveInt(game.playtime),
        platform: platforms[0] ?? null,
        year: yearFromDate(game.released),
      },
    ];
  });
}
