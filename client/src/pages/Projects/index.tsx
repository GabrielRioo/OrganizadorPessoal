import { useState, type FormEvent } from "react";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { FormDialog } from "../../components/FormDialog";
import { ItemCard } from "../../components/ItemCard";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { StatusChip } from "../../components/StatusChip";
import { useListLayout } from "../../hooks/useListLayout";
import type { Project, ProjectStatus } from "../../types/models";
import { formatDate, toDateInputValue } from "../../utils/dates";
import { projectStatusLabels } from "../../utils/labels";
import { projectStatusTone } from "../../utils/statusVisuals";
import { useProjects } from "./hooks/useProjects";

const statuses: ProjectStatus[] = ["PLANNED", "IN_PROGRESS", "PAUSED", "DONE"];
const emptyForm = {
  title: "",
  status: "PLANNED" as ProjectStatus,
  description: "",
  hasDeadline: false,
  deadline: "",
  published: false,
  monetize: false,
};

export function ProjectsPage() {
  const {
    items,
    loading,
    error,
    filters,
    setQuery,
    setStatus,
    setPublished,
    setMonetize,
    load,
    create,
    update,
    remove,
  } = useProjects();
  const { layout, setLayout } = useListLayout("projects");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Project) {
    setEditing(item);
    setForm({
      title: item.title,
      status: item.status,
      description: item.description ?? "",
      hasDeadline: Boolean(item.deadline),
      deadline: toDateInputValue(item.deadline),
      published: item.published,
      monetize: item.monetize,
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      status: form.status,
      description: form.description || null,
      deadline: form.hasDeadline && form.deadline ? form.deadline : null,
      published: form.published,
      monetize: form.monetize,
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
        title="Projetos"
        subtitle="O que você já fez, está fazendo ou quer fazer."
        actionLabel="Adicionar projeto"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <TextField
        label="Buscar"
        value={filters.q ?? ""}
        onChange={(event) => setQuery(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Todos"
          color={!filters.status ? "primary" : "default"}
          onClick={() => setStatus("")}
        />
        {statuses.map((item) => (
          <Chip
            key={item}
            label={projectStatusLabels[item]}
            color={filters.status === item ? "primary" : "default"}
            onClick={() => setStatus(item)}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Publicação: todas"
          color={filters.published === "" || filters.published === undefined ? "primary" : "default"}
          onClick={() => setPublished("")}
        />
        <Chip
          label="Publicado"
          color={filters.published === true ? "primary" : "default"}
          onClick={() => setPublished(true)}
        />
        <Chip
          label="Não publicado"
          color={filters.published === false ? "primary" : "default"}
          onClick={() => setPublished(false)}
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Monetização: todas"
          color={filters.monetize === "" || filters.monetize === undefined ? "primary" : "default"}
          onClick={() => setMonetize("")}
        />
        <Chip
          label="SaaS"
          color={filters.monetize === true ? "primary" : "default"}
          onClick={() => setMonetize(true)}
        />
        <Chip
          label="Sem SaaS"
          color={filters.monetize === false ? "primary" : "default"}
          onClick={() => setMonetize(false)}
        />
      </Stack>
      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhum projeto cadastrado ainda."
        emptyAction="Adicionar projeto"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant={layout}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              subtitle={item.deadline ? `Data base: ${formatDate(item.deadline)}` : "Sem data base"}
              notes={item.description}
              onEdit={() => openEdit(item)}
              onDelete={() => void remove(item.id)}
            >
              <StatusChip label={projectStatusLabels[item.status]} tone={projectStatusTone(item.status)} />
              <StatusChip
                label={item.published ? "Publicado" : "Não publicado"}
                tone={item.published ? "success" : "default"}
              />
              <StatusChip
                label={item.monetize ? "SaaS" : "Sem SaaS"}
                tone={item.monetize ? "info" : "default"}
              />
            </ItemCard>
          ))}
        </StaggeredList>
      </PageState>
      <FormDialog
        open={open}
        title={editing ? "Editar projeto" : "Novo projeto"}
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
          select
          label="Status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}
          fullWidth
        >
          {statuses.map((item) => (
            <MenuItem key={item} value={item}>
              {projectStatusLabels[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Tem data base?"
          value={form.hasDeadline ? "yes" : "no"}
          onChange={(event) => {
            const hasDeadline = event.target.value === "yes";
            setForm({ ...form, hasDeadline, deadline: hasDeadline ? form.deadline : "" });
          }}
          fullWidth
        >
          <MenuItem value="no">Não</MenuItem>
          <MenuItem value="yes">Sim</MenuItem>
        </TextField>
        <Collapse in={form.hasDeadline} unmountOnExit>
          <TextField
            label="Data base"
            type="date"
            value={form.deadline}
            onChange={(event) => setForm({ ...form, deadline: event.target.value })}
            required={form.hasDeadline}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Collapse>
        <FormControlLabel
          control={
            <Switch
              checked={form.published}
              onChange={(event) => setForm({ ...form, published: event.target.checked })}
            />
          }
          label="Já está publicado"
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.monetize}
              onChange={(event) => setForm({ ...form, monetize: event.target.checked })}
            />
          }
          label="Quer monetizar / SaaS"
        />
        <TextField
          label="Descrição"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          multiline
          minRows={3}
          fullWidth
        />
      </FormDialog>
    </>
  );
}
