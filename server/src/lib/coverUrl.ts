const allowedHosts = new Set([
  "image.tmdb.org",
  "media.rawg.io",
  "steamcdn-a.akamaihd.net",
  "shared.akamai.steamstatic.com",
  "cdn.cloudflare.steamstatic.com",
  "cdn.akamai.steamstatic.com",
]);

export function isAllowedCoverUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.toLowerCase();
    return allowedHosts.has(host) || host.endsWith(".rawg.io");
  } catch {
    return false;
  }
}
