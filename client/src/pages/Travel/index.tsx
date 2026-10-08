import { useState, type FormEvent } from "react";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "../../components/FormDialog";
import { ItemCard } from "../../components/ItemCard";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { StatusChip } from "../../components/StatusChip";
import { useListLayout } from "../../hooks/useListLayout";
import type { Travel, TravelStatus } from "../../types/models";
import { toDateInputValue, formatDate } from "../../utils/dates";
import { travelStatusLabels } from "../../utils/labels";
import { useTravels } from "./hooks/useTravels";

const statuses: TravelStatus[] = ["PLANNING", "VISITED"];
const emptyForm = {
  place: "",
  country: "",
  status: "PLANNING" as TravelStatus,
  visitedAt: "",
  notes: "",
};

export function TravelPage() {
  const { items, loading, error, q, status, setQuery, setStatus, load, create, update, remove } =
    useTravels();
  const { layout, setLayout } = useListLayout("travel");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Travel | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Travel) {
    setEditing(item);
    setForm({
      place: item.place,
      country: item.country ?? "",
      status: item.status,
      visitedAt: toDateInputValue(item.visitedAt),
      notes: item.notes ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      place: form.place,
      country: form.country || null,
      status: form.status,
      visitedAt: form.visitedAt || null,
      notes: form.notes || null,
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

  return (
    <>
      <PageHeader
        title="Viagens"
        subtitle="Onde você já esteve e para onde quer ir."
        actionLabel="Adicionar local"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <TextField
        label="Buscar local ou país"
        value={q}
        onChange={(event) => setQuery(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Chip label="Todos" color={!status ? "primary" : "default"} onClick={() => setStatus("")} />
        {statuses.map((item) => (
          <Chip
            key={item}
            label={travelStatusLabels[item]}
            color={status === item ? "primary" : "default"}
            onClick={() => setStatus(item)}
          />
        ))}
      </Stack>
      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhum local cadastrado ainda."
        emptyAction="Adicionar local"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant={layout}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.place}
              subtitle={[item.country, item.visitedAt ? formatDate(item.visitedAt) : null]
                .filter(Boolean)
                .join(" · ")}
              notes={item.notes}
              onEdit={() => openEdit(item)}
              onDelete={() => void remove(item.id)}
            >
              <StatusChip
                label={travelStatusLabels[item.status]}
                tone={item.status === "VISITED" ? "success" : "info"}
              />
            </ItemCard>
          ))}
        </StaggeredList>
      </PageState>
      <FormDialog
        open={open}
        title={editing ? "Editar local" : "Novo local"}
        saving={saving}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Local"
          value={form.place}
          onChange={(event) => setForm({ ...form, place: event.target.value })}
          required
          fullWidth
          sx={{ mt: 1 }}
        />
        <TextField
          label="País"
          value={form.country}
          onChange={(event) => setForm({ ...form, country: event.target.value })}
          fullWidth
        />
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as TravelStatus })}
          fullWidth
        >
          {statuses.map((item) => (
            <MenuItem key={item} value={item}>
              {travelStatusLabels[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Data da visita"
          type="date"
          value={form.visitedAt}
          onChange={(event) => setForm({ ...form, visitedAt: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
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
