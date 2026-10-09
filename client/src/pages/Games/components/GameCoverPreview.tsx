import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type GameCoverPreviewProps = {
  title: string;
  coverUrl: string | null;
};

export function GameCoverPreview({ title, coverUrl }: GameCoverPreviewProps) {
  const [broken, setBroken] = useState(false);
  const showCover = Boolean(coverUrl) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [coverUrl]);

  return (
    <Box
      sx={{
        width: { xs: 132, sm: "100%" },
        maxWidth: 168,
        mx: { xs: "auto", sm: 0 },
        borderRadius: "6px",
        overflow: "hidden",
        aspectRatio: "2 / 3",
        bgcolor: "#1b2838",
        border: "1px solid rgba(23, 33, 30, 0.16)",
        position: "relative",
      }}
    >
      {showCover ? (
        <Box
          component="img"
          src={coverUrl ?? undefined}
          alt={title ? `Capa de ${title}` : "Capa do jogo"}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
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
            display: "grid",
            placeItems: "center",
            px: 1.5,
            bgcolor: "#2a475e",
          }}
        >
          <Typography variant="caption" color="#c7d5e0" textAlign="center">
            {title.trim() ? title : "Selecione um título para ver a capa"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
