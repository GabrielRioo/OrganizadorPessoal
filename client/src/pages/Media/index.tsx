import { useCallback, useState, type FormEvent } from "react";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import { CatalogSuggestField } from "../../components/CatalogSuggestField";
import { FormDialog } from "../../components/FormDialog";
import { CoverPoster } from "../../components/CoverPoster";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { StatusChip } from "../../components/StatusChip";
import { useListLayout } from "../../hooks/useListLayout";
import type { MediaItem, MediaKind, MediaRating, MediaStatus } from "../../types/models";
import { mediaKindLabels, mediaRatingLabels, mediaStatusLabels } from "../../utils/labels";
import { mediaStatusTone } from "../../utils/statusVisuals";
import { catalogService, type MediaCatalogHit } from "../../services/catalogService";
import { useMedia } from "./hooks/useMedia";

type MediaSuggestion = MediaCatalogHit & { id: string; subtitle: string };

const kinds: Array<MediaKind | ""> = ["", "MOVIE", "SERIES", "ANIME"];
const statuses: MediaStatus[] = ["WATCHLIST", "WATCHING", "PAUSED", "WAITING", "WATCHED"];
const ratings: Array<MediaRating | ""> = ["", "GOOD", "OKAY", "BAD"];

const emptyForm = {
  title: "",
  kind: "SERIES" as MediaKind,
  status: "WATCHLIST" as MediaStatus,
  currentSeason: "",
  currentEpisode: "",
  rating: "" as MediaRating | "",
  genre: "",
  watchedOn: "",
  notes: "",
  coverUrl: null as string | null,
  year: "",
};

export function MediaPage() {
  const { items, loading, error, filters, load, create, update, remove, setQuery, setKind, setStatus } =
    useMedia();
  const { layout, setLayout } = useListLayout("media", "cards");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setForm({
      title: item.title,
      kind: item.kind,
      status: item.status,
      currentSeason: item.currentSeason?.toString() ?? "",
      currentEpisode: item.currentEpisode?.toString() ?? "",
      rating: item.rating ?? "",
      genre: item.genre ?? "",
      watchedOn: item.watchedOn ?? "",
      notes: item.notes ?? "",
      coverUrl: item.coverUrl,
      year: item.year?.toString() ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      kind: form.kind,
      status: form.status,
      currentSeason: form.currentSeason ? Number(form.currentSeason) : null,
      currentEpisode: form.currentEpisode ? Number(form.currentEpisode) : null,
      rating: form.rating ? form.rating : null,
      genre: form.genre || null,
      watchedOn: form.watchedOn || null,
      notes: form.notes || null,
      coverUrl: form.coverUrl,
      year: form.year ? Number(form.year) : null,
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

  const searchMedia = useCallback(
    async (query: string) => {
      const response = await catalogService.searchMedia(query, form.kind);
      return {
        available: response.available,
        results: response.results.map((hit, index): MediaSuggestion => ({
          ...hit,
          id: `${hit.title}-${index}`,
          subtitle: [hit.year, hit.genre].filter(Boolean).join(" · "),
        })),
      };
    },
    [form.kind],
  );

  return (
    <>
      <PageHeader
        title="Filmes, séries e animes"
        subtitle="O que você já viu, está vendo ou não quer esquecer."
        actionLabel="Adicionar"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <Tabs
        value={filters.kind ?? ""}
        onChange={(_event, value: MediaKind | "") => setKind(value)}
        sx={{ mb: 2 }}
      >
        {kinds.map((kind) => (
          <Tab key={kind || "all"} value={kind} label={kind ? mediaKindLabels[kind] : "Todos"} />
        ))}
      </Tabs>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar pelo nome"
          value={filters.q}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          <Chip label="Todos os status" color={!filters.status ? "primary" : "default"} onClick={() => setStatus("")} />
          {statuses.map((status) => (
            <Chip
              key={status}
              label={mediaStatusLabels[status]}
              color={filters.status === status ? "primary" : "default"}
              onClick={() => setStatus(status)}
            />
          ))}
        </Stack>
      </Stack>

      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nada cadastrado ainda. Adicione um filme, série ou anime."
        emptyAction="Adicionar"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant="posters" posterMinWidth={layout === "stack" ? 210 : 158} spacing={layout === "stack" ? 2 : 1.5}>
          {items.map((item) => (
            <CoverPoster
              key={item.id}
              title={item.title}
              coverUrl={item.coverUrl}
              meta={[
                mediaKindLabels[item.kind],
                item.year,
                item.watchedOn,
                item.currentSeason != null || item.currentEpisode != null
                  ? `T${item.currentSeason ?? "?"} E${item.currentEpisode ?? "?"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              onEdit={() => openEdit(item)}
              onDelete={() => void remove(item.id)}
            >
              <StatusChip label={mediaStatusLabels[item.status]} tone={mediaStatusTone(item.status)} inverted />
              {item.rating ? <StatusChip label={mediaRatingLabels[item.rating]} inverted /> : null}
            </CoverPoster>
          ))}
        </StaggeredList>
      </PageState>

      <FormDialog
        open={open}
        title={editing ? "Editar" : "Novo título"}
        saving={saving}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          select
          label="Tipo"
          value={form.kind}
          onChange={(event) => setForm({ ...form, kind: event.target.value as MediaKind })}
          fullWidth
          sx={{ mt: 1 }}
        >
          {kinds.filter(Boolean).map((kind) => (
            <MenuItem key={kind} value={kind}>
              {mediaKindLabels[kind]}
            </MenuItem>
          ))}
        </TextField>
        <CatalogSuggestField
          label="Título"
          value={form.title}
          onInputChange={(title) => setForm((current) => ({ ...current, title }))}
          search={searchMedia}
          onSelect={(option) =>
            setForm((current) => ({
              ...current,
              title: option.title,
              coverUrl: option.coverUrl,
              genre: option.genre || current.genre,
              year: option.year ? String(option.year) : current.year,
            }))
          }
        />
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as MediaStatus })}
          fullWidth
        >
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {mediaStatusLabels[status]}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Temporada"
            type="number"
            value={form.currentSeason}
            onChange={(event) => setForm({ ...form, currentSeason: event.target.value })}
            fullWidth
          />
          <TextField
            label="Episódio"
            type="number"
            value={form.currentEpisode}
            onChange={(event) => setForm({ ...form, currentEpisode: event.target.value })}
            fullWidth
          />
        </Stack>
        <TextField
          select
          label="Avaliação"
          value={form.rating}
          onChange={(event) => setForm({ ...form, rating: event.target.value as MediaRating | "" })}
          fullWidth
        >
          <MenuItem value="">Sem avaliação</MenuItem>
          {ratings.filter(Boolean).map((rating) => (
            <MenuItem key={rating} value={rating}>
              {mediaRatingLabels[rating]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Gênero"
          value={form.genre}
          onChange={(event) => setForm({ ...form, genre: event.target.value })}
          fullWidth
        />
        <TextField
          label="Onde assisti"
          value={form.watchedOn}
          onChange={(event) => setForm({ ...form, watchedOn: event.target.value })}
          fullWidth
          helperText="Netflix, cinema, TV..."
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
