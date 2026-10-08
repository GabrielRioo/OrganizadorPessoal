import { Children, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

type StaggeredListProps = {
  children: ReactNode;
  spacing?: number;
  variant?: "stack" | "cards" | "posters";
  posterMinWidth?: number;
};

export function StaggeredList({
  children,
  spacing = 2,
  variant = "stack",
  posterMinWidth = 158,
}: StaggeredListProps) {
  const items = Children.toArray(children);

  if (variant === "posters") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: `repeat(auto-fill, minmax(${posterMinWidth}px, 1fr))`,
          },
          gap: spacing,
        }}
      >
        {items.map((child, index) => (
          <Box
            key={index}
            sx={{
              animation: "fadeUp 0.5s ease both",
              animationDelay: `${Math.min(index, 14) * 45}ms`,
            }}
          >
            {child}
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === "cards") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(280px, 1fr))" },
          gridAutoRows: "1fr",
          gap: spacing,
          alignItems: "stretch",
        }}
      >
        {items.map((child, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              minHeight: 0,
              "& > *": { flex: 1, width: "100%", height: "100%" },
              animation: "fadeUp 0.5s ease both",
              animationDelay: `${Math.min(index, 14) * 55}ms`,
            }}
          >
            {child}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Stack spacing={spacing} direction="column">
      {items.map((child, index) => (
        <Box
          key={index}
          sx={{
            animation: "fadeUp 0.5s ease both",
            animationDelay: `${Math.min(index, 14) * 55}ms`,
          }}
        >
          {child}
        </Box>
      ))}
    </Stack>
  );
}
