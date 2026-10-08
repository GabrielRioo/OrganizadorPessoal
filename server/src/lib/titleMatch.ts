export function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim();
}

export function isCloseTitle(stored: string, found: string): boolean {
  const a = normalizeTitle(stored);
  const b = normalizeTitle(found);
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  return a.includes(b) || b.includes(a);
}

export function titleScore(query: string, title: string): number {
  const q = normalizeTitle(query);
  const t = normalizeTitle(title);
  if (!q || !t) {
    return 0;
  }
  if (t === q) {
    return 100;
  }
  if (t.startsWith(q) || q.startsWith(t)) {
    return 80;
  }
  if (t.includes(q) || q.includes(t)) {
    return 60;
  }
  const queryTokens = q.split(" ");
  const titleTokens = new Set(t.split(" "));
  const overlap = queryTokens.filter((token) => titleTokens.has(token)).length;
  return (overlap / queryTokens.length) * 40;
}

export function isSteamPortraitCover(url: string | null | undefined): boolean {
  return Boolean(
    url && (url.includes("library_600x900") || url.includes("library_capsule")),
  );
}
