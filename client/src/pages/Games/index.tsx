import { useCallback, useState, type FormEvent } from "react";
import { GameCoverPreview } from "./components/GameCoverPreview";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CatalogSuggestField } from "../../components/CatalogSuggestField";
import { FormDialog } from "../../components/FormDialog";
import { CoverPoster } from "../../components/CoverPoster";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { StatusChip } from "../../components/StatusChip";
import { useListLayout } from "../../hooks/useListLayout";
import type { Game, GameStatus } from "../../types/models";
import { gameStatusLabels } from "../../utils/labels";
import { gameStatusIcon, gameStatusTone } from "../../utils/statusVisuals";
import { catalogService, type GameCatalogHit } from "../../services/catalogService";
import type { GameSort } from "../../services/gameService";
import { useGames } from "./hooks/useGames";

type GameSuggestion = GameCatalogHit & { id: string; subtitle: string };

const statuses: GameStatus[] = ["WISHLIST", "BACKLOG", "PLAYING", "CASUAL", "EVENTUAL", "PAUSED", "PLAYED", "ABANDONED", "SHELVED", "ONLINE"];

const sortOptions: Array<{ value: GameSort; label: string }> = [
  { value: "queue", label: "Fila" },
  { value: "updated", label: "Atualizados" },
  { value: "title", label: "Título A–Z" },
  { value: "hours", label: "Mais horas" },
  { value: "added", label: "Adicionados" },
];

const emptyForm = {
  title: "",
  platform: "",
  status: "BACKLOG" as GameStatus,
  queuePosition: "",
  notes: "",
  coverUrl: null as string | null,
  playtimeHours: "",
};

export function GamesPage() {
  const {
    items,
    loading,
    error,
    filters,
    platforms,
    load,
    create,
    update,
    remove,
    setQuery,
    setStatus,
    setPlatform,
    setSort,
    setInvert,
  } = useGames();
  const { layout, setLayout } = useListLayout("games", "cards");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(game: Game) {
    setEditing(game);
    setForm({
      title: game.title,
      platform: game.platform,
      status: game.status,
      queuePosition: game.queuePosition?.toString() ?? "",
      notes: game.notes ?? "",
      coverUrl: game.coverUrl,
      playtimeHours: game.playtimeHours?.toString() ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      platform: form.platform,
      status: form.status,
      queuePosition: form.queuePosition ? Number(form.queuePosition) : null,
      notes: form.notes || null,
      coverUrl: form.coverUrl,
      playtimeHours: form.playtimeHours ? Number(form.playtimeHours) : null,
    };
    try {
      if (editing) {
        await update(editing.id, payload);
      } else {
        await create(payload);
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const searchGames = useCallback(async (query: string) => {
    const response = await catalogService.searchGames(query);
    return {
      available: response.available,
      results: response.results.map((hit, index): GameSuggestion => ({
        ...hit,
        id: `${hit.title}-${index}`,
        subtitle: [hit.platform, hit.year, hit.playtimeHours ? `~${hit.playtimeHours}h` : null]
          .filter(Boolean)
          .join(" · "),
      })),
    };
  }, []);

  const nextUp = items.filter((game) => game.queuePosition != null);

  return (
    <>
      <PageHeader
        title="Jogos"
        subtitle="O que você tem, o que está jogando e o que quer jogar."
        actionLabel="Adicionar jogo"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar pelo nome"
          value={filters.q}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Plataforma"
          value={filters.platform || "all"}
          onChange={(event) => setPlatform(event.target.value === "all" ? "" : event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          {platforms.map((platform) => (
            <MenuItem key={platform} value={platform}>
              {platform}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ordenar"
          value={filters.sort ?? "queue"}
          onChange={(event) => setSort(event.target.value as GameSort)}
          sx={{ minWidth: 180 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ordem"
          value={filters.invert ? "invert" : "normal"}
          onChange={(event) => setInvert(event.target.value === "invert")}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="invert">Invertida</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Todos"
          color={!filters.status ? "primary" : "default"}
          onClick={() => setStatus("")}
        />
        {statuses.map((status) => (
          <Chip
            key={status}
            label={gameStatusLabels[status]}
            color={filters.status === status ? "primary" : "default"}
            onClick={() => setStatus(status)}
          />
        ))}
      </Stack>

      {nextUp.length > 0 && !filters.status && !filters.q ? (
        <Box sx={{ mb: 3, animation: "fadeUp 0.4s ease both" }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Próximos a jogar
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {nextUp.map((game) => (
              <Chip key={game.id} label={`${game.queuePosition}. ${game.title}`} />
            ))}
          </Stack>
        </Box>
      ) : null}

      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhum jogo encontrado. Adicione um da sua biblioteca ou da wishlist."
        emptyAction="Adicionar jogo"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant="posters" posterMinWidth={layout === "stack" ? 210 : 158} spacing={layout === "stack" ? 2 : 1.5}>
          {items.map((game) => (
            <CoverPoster
              key={game.id}
              title={game.title}
              coverUrl={game.coverUrl}
              meta={[game.platform, game.playtimeHours ? `~${game.playtimeHours}h` : null]
                .filter(Boolean)
                .join(" · ")}
              badge={game.queuePosition ? `#${game.queuePosition}` : null}
              onEdit={() => openEdit(game)}
              onDelete={() => void remove(game.id)}
            >
              <StatusChip
                label={gameStatusLabels[game.status]}
                tone={gameStatusTone(game.status)}
                icon={gameStatusIcon(game.status)}
                inverted
              />
            </CoverPoster>
          ))}
        </StaggeredList>
      </PageState>

      <FormDialog
        open={open}
        title={editing ? "Editar jogo" : "Novo jogo"}
        saving={saving}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
        aside={<GameCoverPreview title={form.title} coverUrl={form.coverUrl} />}
      >
        <CatalogSuggestField
          label="Título"
          value={form.title}
          onInputChange={(title) =>
            setForm((current) => ({
              ...current,
              title,
              coverUrl: title === current.title ? current.coverUrl : null,
            }))
          }
          search={searchGames}
          onSelect={(option) =>
            setForm((current) => ({
              ...current,
              title: option.title,
              platform: option.platform || current.platform,
              coverUrl: option.coverUrl,
              playtimeHours: option.playtimeHours ? String(option.playtimeHours) : current.playtimeHours,
            }))
          }
        />
        <TextField
          label="Plataforma"
          value={form.platform}
          onChange={(event) => setForm({ ...form, platform: event.target.value })}
          required
          fullWidth
          helperText="Steam, PS5, Switch..."
        />
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as GameStatus })}
          fullWidth
        >
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {gameStatusLabels[status]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Posição na fila (opcional)"
          type="number"
          value={form.queuePosition}
          onChange={(event) => setForm({ ...form, queuePosition: event.target.value })}
          fullWidth
        />
        <TextField
          label="Tempo estimado (horas)"
          type="number"
          value={form.playtimeHours}
          onChange={(event) => setForm({ ...form, playtimeHours: event.target.value })}
          fullWidth
        />
        <TextField
          label="Notas"
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          multiline
          minRows={2}
          fullWidth
        />
      </FormDialog>
    </>
  );
}
