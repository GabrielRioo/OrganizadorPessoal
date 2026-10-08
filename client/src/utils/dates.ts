export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function daysUntil(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${toDateInputValue(targetDate)}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function countdownLabel(targetDate: string): string {
  const days = daysUntil(targetDate);
  if (days === 0) {
    return "É hoje";
  }
  if (days > 0) {
    return days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`;
  }
  const past = Math.abs(days);
  return past === 1 ? "Foi há 1 dia" : `Foi há ${past} dias`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(`${toDateInputValue(value)}T00:00:00`);
  return date.toLocaleDateString("pt-BR");
}
