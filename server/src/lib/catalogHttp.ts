const catalogHeaders = {
  Accept: "application/json",
  "User-Agent": "OrganizadorPessoal/1.0",
};

export async function fetchCatalogJson(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: catalogHeaders,
    });
    if (!response.ok) {
      throw new Error("catalog_upstream");
    }
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}
