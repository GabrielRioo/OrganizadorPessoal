import { fetchCatalogJson } from "../lib/catalogHttp.js";
import type { GameCatalogHit } from "./rawgCatalog.js";

const steamAssetOrigin = "https://shared.akamai.steamstatic.com/store_item_assets/";

type SteamSearchItem = {
  type?: unknown;
  id?: unknown;
  name?: unknown;
};

type SteamSearch = {
  items?: unknown;
};

type SteamStoreAssets = {
  asset_url_format?: unknown;
  library_capsule?: unknown;
  library_capsule_2x?: unknown;
  header?: unknown;
};

type SteamStoreItem = {
  appid?: unknown;
  assets?: SteamStoreAssets;
};

type SteamBrowseResponse = {
  response?: { store_items?: unknown };
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function catalogHeaders(): HeadersInit {
  return { "User-Agent": "OrganizadorPessoal/1.0" };
}

export function steamPortraitUrl(appId: number): string {
  return `${steamAssetOrigin}steam/apps/${appId}/library_600x900.jpg`;
}

function assetUrl(format: string, fileName: string): string {
  const path = format.replace("${FILENAME}", fileName).replace(/\?.*$/u, "");
  return `${steamAssetOrigin}${path}`;
}

async function urlExists(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: catalogHeaders(),
    });
    if (head.ok) {
      return true;
    }
    const ranged = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { ...catalogHeaders(), Range: "bytes=0-1" },
    });
    return ranged.ok || ranged.status === 206;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLibraryCapsules(appIds: number[]): Promise<Map<number, string>> {
  const found = new Map<number, string>();
  if (appIds.length === 0) {
    return found;
  }
  const url = new URL("https://api.steampowered.com/IStoreBrowseService/GetItems/v1");
  url.searchParams.set(
    "input_json",
    JSON.stringify({
      ids: appIds.map((appid) => ({ appid })),
      context: { language: "english", country_code: "BR", steam_realm: 1 },
      data_request: { include_assets: true },
    }),
  );
  const payload = (await fetchCatalogJson(url)) as SteamBrowseResponse;
  const items = Array.isArray(payload.response?.store_items) ? payload.response.store_items : [];
  for (const entry of items) {
    const item = entry as SteamStoreItem;
    const appId = asId(item.appid);
    const format = asString(item.assets?.asset_url_format);
    const capsule = asString(item.assets?.library_capsule) ?? asString(item.assets?.library_capsule_2x);
    if (!appId || !format || !capsule) {
      continue;
    }
    found.set(appId, assetUrl(format, capsule));
  }
  return found;
}

export function steamAppIdFromCover(url: string | null | undefined): number | null {
  const match = url?.match(/\/apps\/(\d+)\//u);
  if (!match) {
    return null;
  }
  const appId = Number(match[1]);
  return Number.isInteger(appId) && appId > 0 ? appId : null;
}

export async function resolveSteamLibraryCapsules(appIds: number[]): Promise<Map<number, string>> {
  return fetchLibraryCapsules(appIds);
}

export async function steamPortraitExists(appId: number): Promise<string | null> {
  const hashed = await fetchLibraryCapsules([appId]);
  if (hashed.has(appId)) {
    return hashed.get(appId) ?? null;
  }
  const classic = steamPortraitUrl(appId);
  return (await urlExists(classic)) ? classic : null;
}

export async function searchSteamGames(query: string): Promise<GameCatalogHit[]> {
  const term = query.replace(/[™®©]/gu, " ").replace(/\s+/gu, " ").trim();
  const url = new URL("https://store.steampowered.com/api/storesearch/");
  url.searchParams.set("term", term);
  url.searchParams.set("l", "english");
  url.searchParams.set("cc", "BR");

  const payload = (await fetchCatalogJson(url)) as SteamSearch;
  const items = Array.isArray(payload.items) ? payload.items : [];
  const apps = items.flatMap((entry) => {
    const item = entry as SteamSearchItem;
    if (asString(item.type) !== "app") {
      return [];
    }
    const title = asString(item.name);
    const appId = asId(item.id);
    if (!title || !appId) {
      return [];
    }
    return [{ title, appId }];
  }).slice(0, 8);

  const hashed = await fetchLibraryCapsules(apps.map((app) => app.appId)).catch(
    () => new Map<number, string>(),
  );

  const classicFallback = await Promise.all(
    apps.map(async (app) => {
      if (hashed.has(app.appId)) {
        return null;
      }
      const classic = steamPortraitUrl(app.appId);
      return (await urlExists(classic)) ? classic : null;
    }),
  );

  return apps.flatMap((app, index) => {
    const coverUrl = hashed.get(app.appId) ?? classicFallback[index] ?? null;
    if (!coverUrl) {
      return [];
    }
    const hit: GameCatalogHit = {
      title: app.title,
      coverUrl,
      playtimeHours: null,
      platform: "Steam",
      year: null,
    };
    return [hit];
  });
}
