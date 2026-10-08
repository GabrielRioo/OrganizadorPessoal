import type { ReactNode } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

const clamp = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
  overflowWrap: "anywhere" as const,
  wordBreak: "break-word" as const,
});

type ItemCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function ItemCardActions({ onEdit, onDelete }: ItemCardActionsProps) {
  return (
    <Box sx={{ display: "flex", flexShrink: 0, flexWrap: "nowrap" }}>
      <IconButton aria-label="Editar" onClick={onEdit} size="small">
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton aria-label="Excluir" onClick={onDelete} size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

type ItemCardProps = {
  title: string;
  subtitle?: string;
  notes?: string | null;
  coverUrl?: string | null;
  extra?: ReactNode;
  children?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export function ItemCard({ title, subtitle, notes, coverUrl, extra, children, onEdit, onDelete }: ItemCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", overflow: "hidden" }}>
      {coverUrl ? (
        <CardMedia
          component="img"
          image={coverUrl}
          alt={`Capa de ${title}`}
          sx={{ width: 108, minHeight: 152, objectFit: "cover", flexShrink: 0, bgcolor: "action.hover" }}
        />
      ) : null}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
          <Typography variant="h6" sx={{ ...clamp(2), flex: 1, minWidth: 0, lineHeight: 1.3, minHeight: "2.6em" }}>
            {title}
          </Typography>
          <ItemCardActions onEdit={onEdit} onDelete={onDelete} />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...clamp(1), mt: 0.25, minHeight: "1.43em" }}
        >
          {subtitle || "\u00a0"}
        </Typography>
        <Typography variant="body2" sx={{ ...clamp(2), mt: 1, minHeight: "2.86em" }}>
          {notes?.trim() || "\u00a0"}
        </Typography>
        {extra != null ? (
          <Box sx={{ mt: 1.25, minHeight: 32, display: "flex", alignItems: "flex-start" }}>{extra}</Box>
        ) : null}
        <Box sx={{ mt: "auto", pt: 1.5, minHeight: 32, display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 1 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
