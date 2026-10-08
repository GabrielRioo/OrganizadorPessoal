import { useCallback, useEffect, useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { FormDialog } from "../../components/FormDialog";
import { ItemCardActions } from "../../components/ItemCard";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { useListLayout } from "../../hooks/useListLayout";
import { countdownService } from "../../services/countdownService";
import type { Countdown } from "../../types/models";
import { countdownLabel, daysUntil, formatDate, toDateInputValue } from "../../utils/dates";

const emptyForm = {
  title: "",
  targetDate: "",
  notes: "",
};

export function CountdownsPage() {
  const [items, setItems] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { layout, setLayout } = useListLayout("countdowns", "cards");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Countdown | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await countdownService.list());
    } catch {
      setError("Não foi possível carregar as contagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Countdown) {
    setEditing(item);
    setForm({
      title: item.title,
      targetDate: toDateInputValue(item.targetDate),
      notes: item.notes ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      targetDate: form.targetDate,
      notes: form.notes || null,
    };
    try {
      if (editing) {
        await countdownService.update(editing.id, payload);
      } else {
        await countdownService.create(payload);
      }
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await countdownService.remove(id);
    await load();
  }

  return (
    <>
      <PageHeader
        title="Contagem regressiva"
        subtitle="Quantos dias faltam para as datas que importam."
        actionLabel="Adicionar data"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhuma data cadastrada. Exemplo: Natal em 25/12/2026."
        emptyAction="Adicionar data"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant={layout}>
          {items.map((item) => {
            const days = daysUntil(item.targetDate);
            return (
              <Card
                key={item.id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(224,122,61,0.1), rgba(255,250,243,0.96) 42%)",
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 0.5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.6em",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <ItemCardActions onEdit={() => openEdit(item)} onDelete={() => void remove(item.id)} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ my: 1, fontSize: "3.2rem", color: days < 0 ? "text.secondary" : "primary.dark" }}
                  >
                    {Math.abs(days)}
                  </Typography>
                  <Typography color="text.secondary">{countdownLabel(item.targetDate)}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(item.targetDate)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.86em",
                    }}
                  >
                    {item.notes?.trim() || "\u00a0"}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </StaggeredList>
      </PageState>
      <FormDialog
        open={open}
        title={editing ? "Editar data" : "Nova data"}
        saving={saving}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Título"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
          fullWidth
          sx={{ mt: 1 }}
        />
        <TextField
          label="Data"
          type="date"
          value={form.targetDate}
          onChange={(event) => setForm({ ...form, targetDate: event.target.value })}
          required
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
