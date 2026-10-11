import { useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type ImageDropFieldProps = {
  previewUrl: string | null;
  onFile: (file: File) => void;
};

export function ImageDropField({ previewUrl, onFile }: ImageDropFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function takeFile(file: File | undefined) {
    if (file?.type.startsWith("image/")) {
      onFile(file);
    }
  }

  return (
    <Box
      tabIndex={0}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        takeFile(event.dataTransfer.files[0]);
      }}
      onPaste={(event: ClipboardEvent) => takeFile(event.clipboardData.files[0])}
      sx={{
        border: "1px dashed",
        borderColor: dragging ? "primary.main" : "divider",
        borderRadius: 2,
        p: 1.5,
        display: "grid",
        gap: 1,
        justifyItems: "center",
        bgcolor: dragging ? "action.hover" : "background.paper",
      }}
    >
      {previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt="Prévia do produto"
          sx={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 1 }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Envie uma foto, arraste o arquivo ou cole com Ctrl+V.
        </Typography>
      )}
      <Button variant="outlined" size="small" onClick={() => inputRef.current?.click()}>
        Escolher imagem
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          takeFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </Box>
  );
}
