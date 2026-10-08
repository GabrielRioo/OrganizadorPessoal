import { useState } from "react";

export type ListLayout = "stack" | "cards";

const STORAGE_PREFIX = "organizer.listLayout.";

function readStored(pageKey: string, fallback: ListLayout): ListLayout {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${pageKey}`);
    if (stored === "stack" || stored === "cards") return stored;
  } catch {
    return fallback;
  }
  return fallback;
}

export function useListLayout(pageKey: string, fallback: ListLayout = "stack") {
  const [layout, setLayoutState] = useState<ListLayout>(() => readStored(pageKey, fallback));

  function setLayout(next: ListLayout) {
    setLayoutState(next);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${pageKey}`, next);
    } catch {
      /* ignore quota / private mode */
    }
  }

  return { layout, setLayout };
}
