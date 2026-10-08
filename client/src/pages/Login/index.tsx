import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { authService } from "../../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void authService
      .me()
      .then((response) => {
        if (response.authenticated) {
          navigate(from, { replace: true });
        }
      })
      .catch(() => undefined);
  }, [from, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await authService.login(password);
      navigate(from, { replace: true });
    } catch {
      setError("Não foi possível entrar. Confira a senha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          color: "#f6f1e8",
          alignItems: "flex-end",
          p: 6,
          background:
            "radial-gradient(520px 320px at 15% 18%, rgba(224, 122, 61, 0.45), transparent 60%), radial-gradient(480px 300px at 80% 80%, rgba(47, 138, 114, 0.35), transparent 55%), linear-gradient(165deg, #1d2a26, #101614 70%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "1px solid rgba(255,250,243,0.12)",
            top: "12%",
            right: "10%",
            animation: "floatGlow 8s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "40%",
            bgcolor: "rgba(224, 122, 61, 0.22)",
            top: "22%",
            right: "18%",
            filter: "blur(2px)",
            animation: "drift 9s ease-in-out infinite",
          }}
        />
        <Box sx={{ position: "relative", maxWidth: 460 }}>
          <Typography variant="overline" sx={{ color: "#f0a06a" }}>
            Espaço privado
          </Typography>
          <Typography variant="h2" sx={{ fontSize: "3.4rem", mt: 1.5, mb: 2, color: "#fffaf3" }}>
            Tudo o que importa, em um só lugar.
          </Typography>
          <Typography sx={{ color: "rgba(246,241,232,0.72)", fontSize: "1.05rem" }}>
            Jogos, filmes, viagens, ideias e o tempo que falta. Um caderno visual só seu.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2.5, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: "rgba(224, 122, 61, 0.16)",
            top: "12%",
            right: "8%",
            animation: "floatGlow 7s ease-in-out infinite",
            display: { md: "none" },
          }}
        />
        <Fade in timeout={500}>
          <Box sx={{ width: "100%", maxWidth: 420, position: "relative" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                mb: 2.5,
                color: "#fffaf3",
                background: "linear-gradient(145deg, #f0a06a, #e07a3d 50%, #1f6b5a)",
                boxShadow: "0 14px 28px rgba(224, 122, 61, 0.28)",
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Typography variant="overline" color="secondary">
              Acesso pessoal
            </Typography>
            <Typography variant="h3" sx={{ mb: 1, fontSize: "2.4rem" }}>
              Entrar
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Digite a senha que você recebeu para abrir o organizador.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={saving} size="large">
                {saving ? "Entrando..." : "Entrar"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
