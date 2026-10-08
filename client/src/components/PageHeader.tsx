import type { ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction: () => void;
  extra?: ReactNode;
};

export function PageHeader({ title, subtitle, actionLabel, onAction, extra }: PageHeaderProps) {
  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          mb: 3.5,
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Box
            sx={{
              width: 42,
              height: 4,
              borderRadius: 999,
              mb: 1.5,
              background: "linear-gradient(90deg, #e07a3d, #1f6b5a)",
            }}
          />
          <Typography variant="h4" sx={{ fontSize: { xs: "2rem", md: "2.4rem" } }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {extra}
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
            {actionLabel}
          </Button>
        </Stack>
      </Box>
    </Fade>
  );
}
