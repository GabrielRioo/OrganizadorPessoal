export function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function formatMoney(value: number | null | undefined, currency = "BRL"): string {
  if (value == null) {
    return "";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export function moneyInputValue(value: number | null | undefined): string {
  if (value == null) {
    return "";
  }
  return value.toString().replace(".", ",");
}
