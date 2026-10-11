import type { ReactNode } from "react";
import Stack from "@mui/material/Stack";

export function FilterToolbar({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      sx={{ mb: 3, alignItems: { md: "center" } }}
    >
      {children}
    </Stack>
  );
}
