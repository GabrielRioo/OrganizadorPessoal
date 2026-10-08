import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { StaggeredList } from "../../components/StaggeredList";
import { useListLayout } from "../../hooks/useListLayout";
import { pomodoroService } from "../../services/countdownService";
import type { PomodoroSession } from "../../types/models";

type Mode = "work" | "break";
type TimerState = "idle" | "running" | "paused";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function playBeep(): void {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
}

export function PomodoroPage() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [mode, setMode] = useState<Mode>("work");
  const [state, setState] = useState<TimerState>("idle");
  const [remaining, setRemaining] = useState(25 * 60);
  const [label, setLabel] = useState("");
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const { layout, setLayout } = useListLayout("pomodoro");
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<string | null>(null);
  const finishingRef = useRef(false);
  const configRef = useRef({ mode, workMin, breakMin, label });
  configRef.current = { mode, workMin, breakMin, label };

  useEffect(() => {
    void pomodoroService
      .list()
      .then(setSessions)
      .catch(() => {
        setError("Não foi possível carregar o histórico.");
      });
  }, []);

  useEffect(() => {
    if (state !== "running") {
      return;
    }
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state !== "running" || remaining > 0 || finishingRef.current) {
      return;
    }
    finishingRef.current = true;
    void finishCycle().finally(() => {
      finishingRef.current = false;
    });
  }, [remaining, state]);

  async function finishCycle() {
    const snapshot = configRef.current;
    playBeep();
    const endedAt = new Date().toISOString();
    if (snapshot.mode === "work" && startedAtRef.current) {
      try {
        const session = await pomodoroService.create({
          startedAt: startedAtRef.current,
          endedAt,
          durationMin: snapshot.workMin,
          label: snapshot.label || null,
        });
        setSessions((current) => [session, ...current].slice(0, 50));
      } catch {
        setError("O timer terminou, mas o histórico não foi salvo.");
      }
    }
    const nextMode: Mode = snapshot.mode === "work" ? "break" : "work";
    setMode(nextMode);
    setState("idle");
    setRemaining((nextMode === "work" ? snapshot.workMin : snapshot.breakMin) * 60);
    startedAtRef.current = null;
  }

  function start() {
    if (state === "idle") {
      startedAtRef.current = new Date().toISOString();
      setRemaining((mode === "work" ? workMin : breakMin) * 60);
    }
    setState("running");
  }

  function pause() {
    setState("paused");
  }

  function reset() {
    setState("idle");
    setRemaining((mode === "work" ? workMin : breakMin) * 60);
    startedAtRef.current = null;
  }

  const total = (mode === "work" ? workMin : breakMin) * 60;
  const progress = total === 0 ? 0 : Math.min(1, remaining / total);

  return (
    <>
      <Fade in timeout={400}>
        <Box sx={{ mb: 3.5 }}>
          <Box
            sx={{
              width: 42,
              height: 4,
              borderRadius: 999,
              mb: 1.5,
              background: "linear-gradient(90deg, #e07a3d, #1f6b5a)",
            }}
          />
          <Typography variant="h4" sx={{ fontSize: { xs: "2rem", md: "2.4rem" } }}>
            Pomodoro
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Foque em um bloco de trabalho e descanse no intervalo.
          </Typography>
        </Box>
      </Fade>
      <Card
        sx={{
          mb: 3,
          maxWidth: 560,
          overflow: "hidden",
          background:
            "radial-gradient(320px 180px at 100% 0%, rgba(224, 122, 61, 0.16), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,250,243,0.96))",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Box
              sx={{
                width: 240,
                height: 240,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: `conic-gradient(${mode === "work" ? "#1f6b5a" : "#e07a3d"} ${progress * 360}deg, rgba(23,33,30,0.08) 0deg)`,
                animation: state === "running" ? "softPulse 1.8s ease-in-out infinite" : "none",
              }}
            >
              <Box
                sx={{
                  width: 188,
                  height: 188,
                  borderRadius: "50%",
                  bgcolor: "#fffaf3",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  boxShadow: "inset 0 0 0 1px rgba(23,33,30,0.06)",
                }}
              >
                <Box>
                  <Typography variant="overline" color="secondary">
                    {mode === "work" ? "Foco" : "Pausa"}
                  </Typography>
                  <Typography variant="h2" sx={{ fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                    {formatSeconds(remaining)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: "center" }}>
            {state !== "running" ? (
              <Button variant="contained" onClick={start}>
                {state === "paused" ? "Continuar" : "Começar"}
              </Button>
            ) : (
              <Button variant="contained" onClick={pause}>
                Pausar
              </Button>
            )}
            <Button onClick={reset}>Resetar</Button>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Minutos de foco"
              type="number"
              value={workMin}
              onChange={(event) => {
                const value = Math.min(180, Math.max(1, Number(event.target.value) || 1));
                setWorkMin(value);
                if (state === "idle" && mode === "work") {
                  setRemaining(value * 60);
                }
              }}
              disabled={state === "running"}
              fullWidth
            />
            <TextField
              label="Minutos de pausa"
              type="number"
              value={breakMin}
              onChange={(event) => {
                const value = Math.min(60, Math.max(1, Number(event.target.value) || 1));
                setBreakMin(value);
                if (state === "idle" && mode === "break") {
                  setRemaining(value * 60);
                }
              }}
              disabled={state === "running"}
              fullWidth
            />
          </Stack>
          <TextField
            label="O que você está fazendo (opcional)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            fullWidth
          />
        </CardContent>
      </Card>
      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6">Sessões recentes</Typography>
        {sessions.length > 0 ? <ListLayoutToggle value={layout} onChange={setLayout} /> : null}
      </Stack>
      {sessions.length === 0 ? (
        <Typography color="text.secondary">Nenhuma sessão salva ainda.</Typography>
      ) : (
        <StaggeredList spacing={1} variant={layout}>
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography>
                  {session.durationMin} min
                  {session.label ? ` · ${session.label}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(session.startedAt).toLocaleString("pt-BR")}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </StaggeredList>
      )}
    </>
  );
}
