import type { MediaKind } from "@prisma/client";
import { env } from "../env.js";
import { fetchCatalogJson } from "../lib/catalogHttp.js";

export type MediaCatalogHit = {
  title: string;
  coverUrl: string | null;
  kind: MediaKind;
  genre: string | null;
  year: number | null;
};

const movieGenres: Record<number, string> = {
  28: "Ação",
  12: "Aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  99: "Documentário",
  18: "Drama",
  10751: "Família",
  14: "Fantasia",
  27: "Terror",
  10749: "Romance",
  878: "Ficção científica",
  53: "Suspense",
};

const tvGenres: Record<number, string> = {
  10759: "Ação e aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  99: "Documentário",
  18: "Drama",
  10751: "Família",
  10765: "Ficção e fantasia",
};

type TmdbItem = {
  title?: unknown;
  name?: unknown;
  poster_path?: unknown;
  release_date?: unknown;
  first_air_date?: unknown;
  genre_ids?: unknown;
};

type TmdbSearch = {
  results?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function posterUrl(path: unknown): string | null {
  const poster = asString(path);
  if (!poster || !poster.startsWith("/")) {
    return null;
  }
  return `https://image.tmdb.org/t/p/w500${poster}`;
}

function yearFromDate(value: unknown): number | null {
  const text = asString(value);
  if (!text) {
    return null;
  }
  const year = Number(text.slice(0, 4));
  return year >= 1870 && year <= 2100 ? year : null;
}

function firstGenre(ids: unknown, map: Record<number, string>): string | null {
  if (!Array.isArray(ids)) {
    return null;
  }
  for (const id of ids) {
    if (typeof id === "number" && map[id]) {
      return map[id];
    }
  }
  return null;
}

async function searchEndpoint(path: "movie" | "tv", query: string): Promise<TmdbItem[]> {
  const url = new URL(`https://api.themoviedb.org/3/search/${path}`);
  url.searchParams.set("api_key", env.tmdbApiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("include_adult", "false");
  const payload = (await fetchCatalogJson(url)) as TmdbSearch;
  return Array.isArray(payload.results) ? (payload.results as TmdbItem[]) : [];
}

export async function searchMedia(query: string, kind: MediaKind): Promise<MediaCatalogHit[]> {
  if (!env.tmdbApiKey) {
    return [];
  }

  if (kind === "MOVIE") {
    const results = await searchEndpoint("movie", query);
    return results.flatMap((item): MediaCatalogHit[] => {
      const title = asString(item.title);
      if (!title) {
        return [];
      }
      return [
        {
          title,
          coverUrl: posterUrl(item.poster_path),
          kind: "MOVIE",
          genre: firstGenre(item.genre_ids, movieGenres),
          year: yearFromDate(item.release_date),
        },
      ];
    });
  }

  const results = await searchEndpoint("tv", query);
  const mapped = results.flatMap((item): MediaCatalogHit[] => {
    const title = asString(item.name);
    if (!title) {
      return [];
    }
    return [
      {
        title,
        coverUrl: posterUrl(item.poster_path),
        kind,
        genre: firstGenre(item.genre_ids, tvGenres),
        year: yearFromDate(item.first_air_date),
      },
    ];
  });

  if (kind === "ANIME") {
    mapped.sort((a, b) => Number(a.genre === "Animação" ? 0 : 1) - Number(b.genre === "Animação" ? 0 : 1));
  }

  return mapped;
}
