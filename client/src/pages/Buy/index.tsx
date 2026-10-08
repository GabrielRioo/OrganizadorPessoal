import { useState, type FormEvent } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormDialog } from "../../components/FormDialog";
import { ItemCard } from "../../components/ItemCard";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { StatusChip } from "../../components/StatusChip";
import { useListLayout } from "../../hooks/useListLayout";
import type { BuyCurrency, BuyItem, BuyPriority, BuyStatus } from "../../types/models";
import { buyCurrencyLabels, buyPriorityLabels, buyStatusLabels } from "../../utils/labels";
import { formatMoney, moneyInputValue, parseMoneyInput } from "../../utils/money";
import { buyPriorityTone, buyStatusTone } from "../../utils/statusVisuals";
import { useBuyItems } from "./hooks/useBuyItems";

const statuses: BuyStatus[] = ["WANT", "RESEARCHING", "WAITING_DEAL", "BOUGHT", "DROPPED"];
const priorities: BuyPriority[] = ["HIGH", "MEDIUM", "LOW"];
const currencies: BuyCurrency[] = ["BRL", "USD", "EUR"];

type LinkForm = { url: string; label: string };

function createEmptyForm() {
  return {
    name: "",
    description: "",
    category: "",
    currentPrice: "",
    targetPrice: "",
    currency: "BRL" as BuyCurrency,
    quantity: "1",
    priority: "MEDIUM" as BuyPriority,
    status: "WANT" as BuyStatus,
    notes: "",
    links: [{ url: "", label: "" }] as LinkForm[],
  };
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isOnTarget(item: BuyItem): boolean {
  return (
    item.currentPrice != null &&
    item.targetPrice != null &&
    item.currentPrice <= item.targetPrice &&
    item.status !== "BOUGHT" &&
    item.status !== "DROPPED"
  );
}

export function BuyPage() {
  const {
    items,
    loading,
    error,
    filters,
    load,
    create,
    update,
    remove,
    setQuery,
    setStatus,
    setPriority,
    setCategory,
  } = useBuyItems();
  const { layout, setLayout } = useListLayout("buy");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<BuyItem | null>(null);
  const [form, setForm] = useState(createEmptyForm);

  function openCreate() {
    setEditing(null);
    setForm(createEmptyForm());
    setOpen(true);
  }

  function openEdit(item: BuyItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category ?? "",
      currentPrice: moneyInputValue(item.currentPrice),
      targetPrice: moneyInputValue(item.targetPrice),
      currency: item.currency,
      quantity: item.quantity.toString(),
      priority: item.priority,
      status: item.status,
      notes: item.notes ?? "",
      links:
        item.links.length > 0
          ? item.links.map((link) => ({ url: link.url, label: link.label ?? "" }))
          : [{ url: "", label: "" }],
    });
    setOpen(true);
  }

  function updateLink(index: number, patch: Partial<LinkForm>) {
    setForm((current) => ({
      ...current,
      links: current.links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const links = form.links
      .map((link) => ({
        url: link.url.trim(),
        label: link.label.trim() || null,
      }))
      .filter((link) => link.url);
    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      currentPrice: parseMoneyInput(form.currentPrice),
      targetPrice: parseMoneyInput(form.targetPrice),
      currency: form.currency,
      quantity: form.quantity ? Number(form.quantity) : 1,
      priority: form.priority,
      status: form.status,
      notes: form.notes || null,
      links,
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
        title="Comprar"
        subtitle="O que você quer comprar, onde viu e quanto está custando agora."
        actionLabel="Adicionar item"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar"
          value={filters.q}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        <TextField
          label="Categoria"
          value={filters.category}
          onChange={(event) => setCategory(event.target.value)}
          sx={{ minWidth: 180 }}
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
        <Chip label="Todos" color={!filters.status ? "primary" : "default"} onClick={() => setStatus("")} />
        {statuses.map((status) => (
          <Chip
            key={status}
            label={buyStatusLabels[status]}
            color={filters.status === status ? "primary" : "default"}
            onClick={() => setStatus(status)}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Qualquer prioridade"
          color={!filters.priority ? "primary" : "default"}
          onClick={() => setPriority("")}
        />
        {priorities.map((priority) => (
          <Chip
            key={priority}
            label={buyPriorityLabels[priority]}
            color={filters.priority === priority ? "primary" : "default"}
            onClick={() => setPriority(priority)}
          />
        ))}
      </Stack>

      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nada na lista ainda. Guarde o que você não quer esquecer de comprar."
        emptyAction="Adicionar item"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant={layout}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.name}
              subtitle={[
                item.category,
                item.quantity > 1 ? `${item.quantity} un.` : null,
                item.currentPrice != null
                  ? formatMoney(item.currentPrice, item.currency)
                  : "Preço não informado",
                item.targetPrice != null ? `meta ${formatMoney(item.targetPrice, item.currency)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              notes={[item.description, item.notes].filter(Boolean).join(" · ")}
              extra={
                item.links.length > 0 ? (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
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
                ) : (
                  "\u00a0"
                )
              }
              onEdit={() => openEdit(item)}
              onDelete={() => void remove(item.id)}
            >
              <StatusChip label={buyStatusLabels[item.status]} tone={buyStatusTone(item.status)} />
              <StatusChip
                label={`Prioridade ${buyPriorityLabels[item.priority].toLowerCase()}`}
                tone={buyPriorityTone(item.priority)}
              />
              {isOnTarget(item) ? <StatusChip label="No preço-alvo" tone="success" /> : null}
            </ItemCard>
          ))}
        </StaggeredList>
      </PageState>

      <FormDialog
        open={open}
        title={editing ? "Editar item" : "Novo item para comprar"}
        saving={saving}
        maxWidth="md"
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Nome"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
          fullWidth
          sx={{ mt: 1 }}
        />
        <TextField
          label="Descrição"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          multiline
          minRows={2}
          fullWidth
          helperText="Modelo, cor, tamanho, o que for útil para reconhecer o produto."
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Categoria"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            fullWidth
            helperText="Casa, eletrônico, roupa..."
          />
          <TextField
            label="Quantidade"
            type="number"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            inputProps={{ min: 1, max: 999 }}
            sx={{ minWidth: 140 }}
          />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as BuyStatus })}
            fullWidth
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {buyStatusLabels[status]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Prioridade"
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value as BuyPriority })}
            fullWidth
          >
            {priorities.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {buyPriorityLabels[priority]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Preço atual"
            value={form.currentPrice}
            onChange={(event) => setForm({ ...form, currentPrice: event.target.value })}
            fullWidth
            helperText="Quanto está agora. Aceita 1299,90."
          />
          <TextField
            label="Preço-alvo"
            value={form.targetPrice}
            onChange={(event) => setForm({ ...form, targetPrice: event.target.value })}
            fullWidth
            helperText="Comprar se chegar nesse valor."
          />
          <TextField
            select
            label="Moeda"
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value as BuyCurrency })}
            sx={{ minWidth: 160 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {buyCurrencyLabels[currency]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Sites onde encontrou
          </Typography>
          <Stack spacing={1.5}>
            {form.links.map((link, index) => (
              <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
                <TextField
                  label="Nome do site"
                  value={link.label}
                  onChange={(event) => updateLink(index, { label: event.target.value })}
                  sx={{ minWidth: { sm: 180 } }}
                  placeholder="Amazon, ML..."
                />
                <TextField
                  label="Link"
                  value={link.url}
                  onChange={(event) => updateLink(index, { url: event.target.value })}
                  fullWidth
                  placeholder="https://"
                />
                <IconButton
                  aria-label="Remover site"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      links: current.links.filter((_, i) => i !== index),
                    }))
                  }
                  disabled={form.links.length === 1}
                  sx={{ mt: 0.5 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setForm((current) =>
                current.links.length >= 8
                  ? current
                  : { ...current, links: [...current.links, { url: "", label: "" }] },
              )
            }
            disabled={form.links.length >= 8}
            sx={{ mt: 1 }}
          >
            Adicionar site
          </Button>
        </Box>
        <TextField
          label="Notas"
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          multiline
          minRows={2}
          fullWidth
          helperText="Lembrete pessoal: cupom, tamanho, por que quer, etc."
        />
      </FormDialog>
    </>
  );
}
