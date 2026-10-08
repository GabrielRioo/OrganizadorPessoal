import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export type StatusTone = "default" | "info" | "success" | "warning" | "error";

type StatusChipProps = {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
  inverted?: boolean;
};

const invertedTone = {
  default: { color: "rgba(255,255,255,0.88)", border: "rgba(255,255,255,0.22)", dot: "rgba(255,255,255,0.55)" },
  info: { color: "#d7e4f2", border: "rgba(160,188,216,0.4)", dot: "#8fb4d4" },
  success: { color: "#d8eadc", border: "rgba(150,188,162,0.4)", dot: "#8fbf9a" },
  warning: { color: "#efe4cc", border: "rgba(196,168,112,0.42)", dot: "#c4a45c" },
  error: { color: "#edd8d6", border: "rgba(196,132,128,0.42)", dot: "#c47a74" },
} as const;

const lightTone = {
  default: { color: "#3d4a45", border: "rgba(23,33,30,0.18)", bg: "rgba(255,255,255,0.7)", dot: "#6d7a74" },
  info: { color: "#2f4a63", border: "rgba(70,110,140,0.28)", bg: "rgba(236,243,247,0.95)", dot: "#4d7a9a" },
  success: { color: "#2f4a38", border: "rgba(70,120,88,0.28)", bg: "rgba(236,245,239,0.95)", dot: "#4d8a62" },
  warning: { color: "#5a4a28", border: "rgba(160,120,50,0.3)", bg: "rgba(247,241,228,0.95)", dot: "#a4843c" },
  error: { color: "#5a3532", border: "rgba(150,80,76,0.28)", bg: "rgba(247,236,234,0.95)", dot: "#a45c56" },
} as const;

export function StatusChip({ label, tone = "default", icon, inverted = false }: StatusChipProps) {
  const palette = inverted ? invertedTone[tone] : lightTone[tone];
  const marker = icon ?? (
    <Box
      component="span"
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        flexShrink: 0,
        bgcolor: palette.dot,
      }}
    />
  );

  return (
    <Chip
      size="small"
      label={label}
      icon={<>{marker}</>}
      sx={{
        height: 24,
        borderRadius: "3px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        px: "8px",
        bgcolor: inverted ? "rgba(8,10,12,0.55)" : lightTone[tone].bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        fontSize: 10,
        fontWeight: 650,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        backdropFilter: inverted ? "blur(6px)" : undefined,
        "& .MuiChip-icon": {
          margin: 0,
          marginLeft: 0,
          marginRight: 0,
          width: 12,
          minWidth: 12,
          height: 12,
          overflow: "hidden",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: palette.color,
        },
        "& .MuiChip-icon .MuiSvgIcon-root": {
          fontSize: "11px !important",
          width: 11,
          height: 11,
        },
        "& .MuiChip-label": {
          padding: 0,
          overflow: "visible",
        },
      }}
    />
  );
}
