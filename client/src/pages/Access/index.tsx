import { useEffect, useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { FormDialog } from "../../components/FormDialog";
import { ItemCard } from "../../components/ItemCard";
import { PageHeader } from "../../components/PageHeader";
import { PageState } from "../../components/PageState";
import { StaggeredList } from "../../components/StaggeredList";
import { authService } from "../../services/authService";
import { useAccessPasswords } from "./hooks/useAccessPasswords";

export function AccessPage() {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const { items, loading, error, load, create, revoke } = useAccessPasswords(isOwner === true);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  useEffect(() => {
    void authService
      .me()
      .then((response) => {
        setIsOwner(response.role === "owner");
      })
      .catch(() => {
        setIsOwner(false);
      });
  }, []);

  async function handleUnlock(event: FormEvent) {
    event.preventDefault();
    setUnlocking(true);
    setUnlockError(null);
    try {
      const result = await authService.login(ownerPassword);
      if (result.role !== "owner") {
        setUnlockError("Somente a senha do organizador pode gerenciar acessos.");
        return;
      }
      setIsOwner(true);
      setOwnerPassword("");
      await load();
    } catch {
      setUnlockError("Não foi possível confirmar. Confira a senha.");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await create({
        label,
        password: password.trim() || null,
      });
      setRevealed(created.password);
      setOpen(false);
      setLabel("");
      setPassword("");
    } finally {
      setSaving(false);
    }
  }

  if (isOwner === null) {
    return null;
  }

  if (!isOwner) {
    return (
      <Box sx={{ maxWidth: 420 }}>
        <PageHeader
          title="Senhas de acesso"
          subtitle="Só quem tem a senha do organizador (.env) pode criar e revogar acessos."
          actionLabel="Nova senha"
          onAction={() => undefined}
        />
        <Box component="form" onSubmit={(event) => void handleUnlock(event)} sx={{ display: "grid", gap: 2 }}>
          {unlockError ? <Alert severity="error">{unlockError}</Alert> : null}
          <TextField
            label="Senha do organizador"
            type="password"
            value={ownerPassword}
            onChange={(event) => setOwnerPassword(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={unlocking}>
            {unlocking ? "Confirmando..." : "Confirmar"}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Senhas de acesso"
        subtitle="Cada senha cria um organizador separado. Quem entrar com ela só vê o que cadastrar."
        actionLabel="Nova senha"
        onAction={() => {
          setLabel("");
          setPassword("");
          setOpen(true);
        }}
      />

      {revealed ? (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setRevealed(null)}>
          Guarde esta senha agora. Ela não aparece de novo: <strong>{revealed}</strong>
        </Alert>
      ) : null}

      <PageState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="Nenhuma senha extra. Só a sua conta de organizador existe por enquanto."
        emptyAction="Nova senha"
        onRetry={() => void load()}
        onEmptyAction={() => setOpen(true)}
      >
        <StaggeredList>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.label}
              subtitle={`Criada em ${new Date(item.createdAt).toLocaleString("pt-BR")}`}
              notes="A senha em si não fica visível depois de criada. Use a lixeira para revogar."
              onEdit={() => undefined}
              onDelete={() => void revoke(item.id)}
            />
          ))}
        </StaggeredList>
      </PageState>

      <FormDialog
        open={open}
        title="Nova senha de acesso"
        saving={saving}
        onClose={() => setOpen(false)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Para quem"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          required
          fullWidth
          helperText="Ex.: Maria, PC da sala..."
        />
        <TextField
          label="Senha (opcional)"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          fullWidth
          helperText="Deixe em branco para o app gerar uma senha."
        />
      </FormDialog>
    </>
  );
}
