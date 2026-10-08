import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TimerIcon from "@mui/icons-material/Timer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { PageState } from "../../components/PageState";
import { ListLayoutToggle } from "../../components/ListLayoutToggle";
import { StaggeredList } from "../../components/StaggeredList";
import { useListLayout } from "../../hooks/useListLayout";
import { dashboardService } from "../../services/gameService";
import type { DashboardData } from "../../types/models";
import { countdownLabel, formatDate } from "../../utils/dates";
import { mediaKindLabels } from "../../utils/labels";
import { formatMoney } from "../../utils/money";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await dashboardService.get());
    } catch {
      setError("Não foi possível carregar o resumo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { layout, setLayout } = useListLayout("dashboard", "cards");
  const hour = new Date().getHours();

  return (
    <>
      <Fade in timeout={400}>
        <Box
          sx={{
            mb: 3.5,
            p: { xs: 3, md: 4.5 },
            borderRadius: 5,
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            color: "#fffaf3",
            background:
              "radial-gradient(420px 220px at 90% 0%, rgba(224, 122, 61, 0.45), transparent 55%), linear-gradient(135deg, #1d2a26 0%, #16332c 55%, #1f6b5a 140%)",
            boxShadow: "0 24px 50px rgba(23, 33, 30, 0.18)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1px solid rgba(255,250,243,0.12)",
              right: -30,
              bottom: -50,
            }}
          />
          <Typography variant="overline" sx={{ color: "#f0a06a", display: "block" }}>
            Painel
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, color: "#fffaf3", fontSize: { xs: "2.1rem", md: "3rem" } }}>
            {greetingForHour(hour)}.
          </Typography>
          <Typography sx={{ mt: 1, mx: "auto", maxWidth: 520, color: "rgba(255,250,243,0.74)" }}>
            Um recorte do que está em andamento — tarefas, telas, jogos e as próximas datas.
          </Typography>
        </Box>
      </Fade>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ListLayoutToggle value={layout} onChange={setLayout} />
      </Box>
      <PageState
        loading={loading}
        error={error}
        empty={false}
        emptyTitle=""
        onRetry={() => void load()}
      >
        <StaggeredList variant={layout}>
          <SummaryCard
            title="Tarefas em andamento"
            to="/tasks"
            accent="#1f6b5a"
            icon={<CheckCircleOutlineIcon />}
            items={data?.doingTasks.map((item) => item.title) ?? []}
            emptyText="Nenhuma tarefa em andamento."
          />
          <SummaryCard
            title="Jogando agora"
            to="/games"
            accent="#3d6f8f"
            icon={<SportsEsportsIcon />}
            items={data?.playingGames.map((item) => `${item.title} · ${item.platform}`) ?? []}
            emptyText="Nenhum jogo marcado como jogando."
          />
          <SummaryCard
            title="Assistindo agora"
            to="/media"
            accent="#b85c7a"
            icon={<LocalMoviesIcon />}
            items={
              data?.watchingMedia.map((item) => `${item.title} · ${mediaKindLabels[item.kind]}`) ?? []
            }
            emptyText="Nada marcado como assistindo."
          />
          <SummaryCard
            title="Quero comprar"
            to="/buy"
            accent="#c45c26"
            icon={<ShoppingBagIcon />}
            items={
              data?.wantToBuy?.map((item) =>
                item.currentPrice != null
                  ? `${item.name} · ${formatMoney(item.currentPrice, item.currency)}`
                  : item.name,
              ) ?? []
            }
            emptyText="Nenhum item de alta prioridade na lista."
          />
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <AccentIcon color="#e07a3d" icon={<EventAvailableIcon />} />
                  <Typography variant="h6">Próximas datas</Typography>
                </Box>
                <Button component={RouterLink} to="/countdowns" endIcon={<ArrowForwardIcon />}>
                  Ver todas
                </Button>
              </Box>
              {(data?.upcomingCountdowns.length ?? 0) === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  Nenhuma contagem regressiva.
                </Typography>
              ) : (
                data?.upcomingCountdowns.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      mt: 1.5,
                      px: 1.5,
                      py: 1.1,
                      borderRadius: 2.5,
                      bgcolor: "rgba(31, 107, 90, 0.06)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 650 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.targetDate)} · {countdownLabel(item.targetDate)}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <AccentIcon color="#c9892a" icon={<TimerIcon />} />
                  <Typography variant="h6">Pomodoro</Typography>
                </Box>
                <Button component={RouterLink} to="/pomodoro" endIcon={<ArrowForwardIcon />}>
                  Abrir timer
                </Button>
              </Box>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                {data?.recentPomodoros[0]
                  ? `Última sessão: ${data.recentPomodoros[0].durationMin} min${
                      data.recentPomodoros[0].label ? ` · ${data.recentPomodoros[0].label}` : ""
                    }`
                  : "Nenhuma sessão recente. Use o timer para focar."}
              </Typography>
            </CardContent>
          </Card>
        </StaggeredList>
      </PageState>
    </>
  );
}

function AccentIcon({ color, icon }: { color: string; icon: ReactNode }) {
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2.5,
        display: "grid",
        placeItems: "center",
        color,
        bgcolor: `${color}1a`,
      }}
    >
      {icon}
    </Box>
  );
}

function SummaryCard({
  title,
  to,
  items,
  emptyText,
  icon,
  accent,
}: {
  title: string;
  to: string;
  items: string[];
  emptyText: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <AccentIcon color={accent} icon={icon} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Button component={RouterLink} to={to} endIcon={<ArrowForwardIcon />}>
            Abrir
          </Button>
        </Box>
        {items.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {emptyText}
          </Typography>
        ) : (
          items.map((item) => (
            <Box
              key={item}
              sx={{
                mt: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
              <Typography>{item}</Typography>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}
