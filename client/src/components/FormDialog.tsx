import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grow from "@mui/material/Grow";
import type { FormEvent, ReactNode } from "react";

type FormDialogProps = {
  open: boolean;
  title: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  aside?: ReactNode;
  maxWidth?: "sm" | "md";
};

export function FormDialog({
  open,
  title,
  saving,
  onClose,
  onSubmit,
  children,
  aside,
  maxWidth = aside ? "md" : "sm",
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} slots={{ transition: Grow }}>
      <form onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              alignItems: "start",
              gridTemplateColumns: aside ? { xs: "1fr", sm: "minmax(132px, 168px) 1fr" } : "1fr",
            }}
          >
            {aside}
            <Box sx={{ display: "grid", gap: 2, minWidth: 0 }}>{children}</Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
