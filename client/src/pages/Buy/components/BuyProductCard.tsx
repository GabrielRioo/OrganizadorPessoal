import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ItemCardActions } from "../../../components/ItemCard";
import { StatusChip } from "../../../components/StatusChip";
import { buyService } from "../../../services/buyService";
import type { BuyItem } from "../../../types/models";
import { buyPriorityLabels, buyStatusLabels } from "../../../utils/labels";
import { formatMoney } from "../../../utils/money";
import { buyPriorityTone, buyStatusTone } from "../../../utils/statusVisuals";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type BuyProductCardProps = {
  item: BuyItem;
  onEdit: () => void;
  onDelete: () => void;
};

export function BuyProductCard({ item, onEdit, onDelete }: BuyProductCardProps) {
  const price = formatMoney(item.currentPrice, item.currency);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box
        sx={{
          aspectRatio: "1 / 1",
          bgcolor: "#ece4d8",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {item.hasImage ? (
          <Box
            component="img"
            src={buyService.imageUrl(item.id)}
            alt={item.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography color="text.secondary" px={2} textAlign="center">
            Sem foto
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 700, lineHeight: 1.25 }}>
            {item.name}
          </Typography>
          <ItemCardActions onEdit={onEdit} onDelete={onDelete} />
        </Box>
        <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
          {price || "Preço a definir"}
        </Typography>
        <Chip
          size="small"
          label={item.category?.trim() || "Sem categoria"}
          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
        />
        {item.targetPrice != null ? (
          <Typography variant="caption" color="text.secondary">
            Alvo {formatMoney(item.targetPrice, item.currency)}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.75} sx={{ mt: "auto", pt: 1, flexWrap: "wrap", gap: 0.75 }}>
          <StatusChip label={buyStatusLabels[item.status]} tone={buyStatusTone(item.status)} />
          <StatusChip
            label={buyPriorityLabels[item.priority]}
            tone={buyPriorityTone(item.priority)}
          />
        </Stack>
        {item.links.length > 0 ? (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {item.links.map((link) => (
              <Chip
                key={`${link.url}-${link.label ?? ""}`}
                size="small"
                clickable
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                icon={<OpenInNewIcon />}
                label={link.label || hostnameOf(link.url)}
                variant="outlined"
              />
            ))}
          </Stack>
        ) : null}
      </Box>
    </Card>
  );
}
