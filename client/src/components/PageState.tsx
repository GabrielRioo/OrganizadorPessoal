import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type PageStateProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle: string;
  emptyAction?: string;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  children: ReactNode;
};

export function PageState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyAction,
  onRetry,
  onEmptyAction,
  children,
}: PageStateProps) {
  if (loading) {
    return (
      <Fade in>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert
          severity="error"
          action={
            onRetry ? (
              <Button color="inherit" size="small" onClick={onRetry}>
                Tentar de novo
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      </Fade>
    );
  }

  if (empty) {
    return (
      <Fade in>
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: 5,
            border: "1px dashed",
            borderColor: "rgba(31, 107, 90, 0.28)",
            background:
              "radial-gradient(420px 160px at 50% 0%, rgba(224, 122, 61, 0.12), transparent 60%), rgba(255, 250, 243, 0.72)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ainda vazio
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {emptyTitle}
          </Typography>
          {emptyAction && onEmptyAction ? (
            <Button variant="contained" onClick={onEmptyAction}>
              {emptyAction}
            </Button>
          ) : null}
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in timeout={350}>
      <Box>{children}</Box>
    </Fade>
  );
}
