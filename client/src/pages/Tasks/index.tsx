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
import type { Task, TaskKind, TaskStatus } from "../../types/models";
import { taskKindLabels, taskStatusLabels } from "../../utils/labels";
import { taskStatusTone } from "../../utils/statusVisuals";
import { useTasks } from "./hooks/useTasks";

const kinds: TaskKind[] = ["TASK", "IDEA"];
const statuses: TaskStatus[] = ["TODO", "DOING", "DONE"];
const emptyForm = {
  title: "",
  kind: "TASK" as TaskKind,
  status: "TODO" as TaskStatus,
  notes: "",
};

export function TasksPage() {
  const {
    items,
    loading,
    error,
    q,
    kind,
    status,
    setQuery,
    setKind,
    setStatus,
    load,
    create,
    update,
    remove,
  } = useTasks();
  const { layout, setLayout } = useListLayout("tasks");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Task) {
    setEditing(item);
    setForm({
      title: item.title,
      kind: item.kind,
      status: item.status,
      notes: item.notes ?? "",
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
        title="Tarefas e ideias"
        subtitle="Lista do que você quer fazer e do que está fazendo."
        actionLabel="Adicionar"
        onAction={openCreate}
        extra={<ListLayoutToggle value={layout} onChange={setLayout} />}
      />
      <TextField
        label="Buscar"
        value={q}
        onChange={(event) => setQuery(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
        <Chip label="Tudo" color={!kind ? "primary" : "default"} onClick={() => setKind("")} />
        {kinds.map((item) => (
          <Chip
            key={item}
            label={taskKindLabels[item]}
            color={kind === item ? "primary" : "default"}
            onClick={() => setKind(item)}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Chip label="Todos os status" color={!status ? "primary" : "default"} onClick={() => setStatus("")} />
        {statuses.map((item) => (
          <Chip
            key={item}
            label={taskStatusLabels[item]}
            color={status === item ? "primary" : "default"}
            onClick={() => setStatus(item)}
          />
        ))}
      </Stack>
      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhuma tarefa ou ideia por aqui."
        emptyAction="Adicionar"
        onRetry={() => void load()}
        onEmptyAction={openCreate}
      >
        <StaggeredList variant={layout}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              notes={item.notes}
              onEdit={() => openEdit(item)}
              onDelete={() => void remove(item.id)}
            >
              <StatusChip label={taskKindLabels[item.kind]} />
              <StatusChip label={taskStatusLabels[item.status]} tone={taskStatusTone(item.status)} />
            </ItemCard>
          ))}
        </StaggeredList>
      </PageState>
      <FormDialog
        open={open}
        title={editing ? "Editar" : "Nova tarefa ou ideia"}
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
          label="Tipo"
          value={form.kind}
          onChange={(event) => setForm({ ...form, kind: event.target.value as TaskKind })}
          fullWidth
        >
          {kinds.map((item) => (
            <MenuItem key={item} value={item}>
              {taskKindLabels[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
          fullWidth
        >
          {statuses.map((item) => (
            <MenuItem key={item} value={item}>
              {taskStatusLabels[item]}
            </MenuItem>
          ))}
        </TextField>
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
