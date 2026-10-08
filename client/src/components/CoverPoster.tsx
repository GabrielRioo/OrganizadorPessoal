import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type CoverPosterProps = {
  title: string;
  coverUrl?: string | null;
  meta?: string;
  badge?: string | null;
  children?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export function CoverPoster({
  title,
  coverUrl,
  meta,
  badge,
  children,
  onEdit,
  onDelete,
}: CoverPosterProps) {
  const [brokenCover, setBrokenCover] = useState(false);
  const showCover = Boolean(coverUrl) && !brokenCover;

  useEffect(() => {
    setBrokenCover(false);
  }, [coverUrl]);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "6px",
        bgcolor: "#1b2838",
        backgroundImage: "none",
        border: "1px solid rgba(23, 33, 30, 0.16)",
        boxShadow: "0 12px 28px rgba(27, 40, 56, 0.28)",
        "&::before": { display: "none" },
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: "0 22px 40px rgba(27, 40, 56, 0.4)",
        },
        "&:hover .cover-actions": { opacity: 1 },
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "2 / 3" }}>
        {showCover ? (
          <Box
            component="img"
            src={coverUrl ?? undefined}
            alt={`Capa de ${title}`}
            referrerPolicy="no-referrer"
            onError={() => setBrokenCover(true)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "#2a475e",
              display: "grid",
              placeItems: "center",
              px: 1.5,
            }}
          >
            <Typography color="#c7d5e0" textAlign="center" fontWeight={700}>
              {title}
            </Typography>
          </Box>
        )}

        {badge ? (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              px: 0.9,
              py: 0.2,
              borderRadius: "4px",
              bgcolor: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {badge}
          </Box>
        ) : null}

        <Box
          className="cover-actions"
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "flex",
            opacity: { xs: 1, md: 0 },
            transition: "opacity 0.16s ease",
            bgcolor: "rgba(0,0,0,0.45)",
            borderRadius: "4px",
          }}
        >
          <IconButton aria-label="Editar" onClick={onEdit} size="small" sx={{ color: "#fff" }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Excluir" onClick={onDelete} size="small" sx={{ color: "#fff" }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            pt: 7,
            px: 1.25,
            pb: 1.25,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.94) 100%)",
            color: "#fff",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>
          {meta ? (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.78)", display: "block", mt: 0.25 }}>
              {meta}
            </Typography>
          ) : null}
          {children ? (
            <Box sx={{ mt: 0.75, display: "flex", flexWrap: "wrap", gap: 0.5 }}>{children}</Box>
          ) : null}
        </Box>
      </Box>
    </Card>
  );
}
