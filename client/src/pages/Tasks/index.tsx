import { useState, type FormEvent, type KeyboardEvent } from "react";
import SendIcon from "@mui/icons-material/Send";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ViewStreamOutlinedIcon from "@mui/icons-material/ViewStreamOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { FilterToolbar } from "../../components/FilterToolbar";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import DeleteIcon from "@mui/icons-material/Delete";
import { useListLayout } from "../../hooks/useListLayout";
import type { Task, TaskKind, TaskStatus } from "../../types/models";
import { taskKindLabels, taskStatusLabels } from "../../utils/labels";
import { useTasks } from "./hooks/useTasks";

const kinds: TaskKind[] = ["TASK", "IDEA"];
const columns: TaskStatus[] = ["TODO", "DOING", "DONE"];

export function TasksPage() {
  const { items, loading, error, q, kind, setQuery, setKind, load, create, update, remove } = useTasks();
  const { layout, setLayout } = useListLayout("tasks-kanban", "cards");
  const orientation = layout === "cards" ? "horizontal" : "vertical";
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitDraft() {
    const title = draft.trim();
    if (!title || saving) {
      return;
    }
    setSaving(true);
    try {
      await create({ title, kind: "TASK", status: "TODO" });
      setDraft("");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submitDraft();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitDraft();
    }
  }

  return (
    <>
      <PageHeader
        title="Tarefas e ideias"
        subtitle="Escreva e envie. Depois arraste entre as colunas ou mude a tag no card."
        extra={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={orientation}
            onChange={(_event, next: "horizontal" | "vertical" | null) => {
              if (next === "horizontal") setLayout("cards");
              if (next === "vertical") setLayout("stack");
            }}
            aria-label="Orientação do quadro"
          >
            <ToggleButton value="horizontal" aria-label="Horizontal">
              <ViewColumnOutlinedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="vertical" aria-label="Vertical">
              <ViewStreamOutlinedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <TextField
          placeholder="O que precisa ser feito?"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          autoComplete="off"
          InputProps={{
            endAdornment: (
              <IconButton type="submit" aria-label="Enviar tarefa" disabled={saving || !draft.trim()}>
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <FilterToolbar>
        <TextField
          label="Buscar"
          value={q}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
          size="small"
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, flexShrink: 0 }}>
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
      </FilterToolbar>
      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nada no quadro ainda. Digite acima e pressione Enter."
        onRetry={() => void load()}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: orientation === "horizontal" ? { xs: "1fr", md: "1fr 1fr 1fr" } : "1fr",
          }}
        >
          {columns.map((column) => (
            <Paper
              key={column}
              variant="outlined"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/task-id");
                if (id) {
                  void update(id, { status: column });
                }
              }}
              sx={{ p: 1.5, bgcolor: "rgba(255,250,243,0.55)", minHeight: 160 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {taskStatusLabels[column]}
              </Typography>
              <Stack spacing={1.25}>
                {items
                  .filter((item) => item.status === column)
                  .map((item) => (
                    <TaskKanbanCard
                      key={item.id}
                      item={item}
                      onKind={(next) => void update(item.id, { kind: next })}
                      onDelete={() => void remove(item.id)}
                    />
                  ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </PageState>
    </>
  );
}

function TaskKanbanCard({
  item,
  onKind,
  onDelete,
}: {
  item: Task;
  onKind: (kind: TaskKind) => void;
  onDelete: () => void;
}) {
  return (
    <Paper
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/task-id", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      sx={{ p: 1.25, cursor: "grab" }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Typography variant="subtitle1" sx={{ flex: 1, lineHeight: 1.3 }}>
          {item.title}
        </Typography>
        <IconButton aria-label="Excluir" onClick={onDelete} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}>
        {kinds.map((entry) => (
          <Chip
            key={entry}
            size="small"
            label={taskKindLabels[entry]}
            color={item.kind === entry ? "primary" : "default"}
            onClick={() => onKind(entry)}
          />
        ))}
      </Stack>
    </Paper>
  );
}
