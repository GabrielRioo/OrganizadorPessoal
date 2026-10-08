import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MovieIcon from "@mui/icons-material/Movie";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TimerIcon from "@mui/icons-material/Timer";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import WorkIcon from "@mui/icons-material/Work";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { authService } from "../services/authService";

const drawerWidth = 280;

const navItems = [
  { to: "/", label: "Início", hint: "Visão geral", icon: <DashboardIcon fontSize="small" /> },
  { to: "/games", label: "Jogos", hint: "Biblioteca", icon: <SportsEsportsIcon fontSize="small" /> },
  { to: "/media", label: "Filmes e séries", hint: "Em tela", icon: <MovieIcon fontSize="small" /> },
  { to: "/travel", label: "Viagens", hint: "Roteiros", icon: <FlightTakeoffIcon fontSize="small" /> },
  { to: "/projects", label: "Projetos", hint: "Em construção", icon: <WorkIcon fontSize="small" /> },
  { to: "/tasks", label: "Tarefas", hint: "Ideias e afazeres", icon: <LightbulbIcon fontSize="small" /> },
  { to: "/buy", label: "Comprar", hint: "Lista de desejos", icon: <ShoppingBagIcon fontSize="small" /> },
  { to: "/pomodoro", label: "Pomodoro", hint: "Foco", icon: <TimerIcon fontSize="small" /> },
  { to: "/countdowns", label: "Datas", hint: "Contagens", icon: <CalendarMonthIcon fontSize="small" /> },
  { to: "/acessos", label: "Acessos", hint: "Senhas", icon: <VpnKeyOutlinedIcon fontSize="small" /> },
];

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canManageAccess, setCanManageAccess] = useState(true);
  const visibleNav = navItems.filter(
    (item) => item.to !== "/acessos" || canManageAccess || location.pathname.startsWith("/acessos"),
  );
  const current = visibleNav.find((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to),
  );

  useEffect(() => {
    void authService
      .me()
      .then((response) => setCanManageAccess(response.role !== "guest"))
      .catch(() => setCanManageAccess(false));
  }, []);

  async function handleLogout() {
    await authService.logout();
    navigate("/login", { replace: true });
  }

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "#f6f1e8",
        background:
          "radial-gradient(420px 280px at 0% 0%, rgba(224, 122, 61, 0.28), transparent 55%), linear-gradient(180deg, #1d2a26 0%, #121917 72%)",
      }}
    >
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "14px",
              background: "linear-gradient(145deg, #f0a06a, #e07a3d 45%, #1f6b5a)",
              boxShadow: "0 10px 24px rgba(224, 122, 61, 0.35)",
              display: "grid",
              placeItems: "center",
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 700,
              fontSize: 20,
              color: "#fffaf3",
            }}
          >
            O
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Organizador
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(246, 241, 232, 0.62)" }}>
              Espaço pessoal
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {visibleNav.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.6,
              borderRadius: 3,
              color: "rgba(246, 241, 232, 0.78)",
              transition: "background-color 0.2s ease, transform 0.2s ease, color 0.2s ease",
              "&:hover": {
                transform: "translateX(4px)",
                bgcolor: "rgba(255, 250, 243, 0.06)",
              },
              "&.active": {
                bgcolor: "rgba(255, 250, 243, 0.1)",
                color: "#fffaf3",
                boxShadow: "inset 0 0 0 1px rgba(255,250,243,0.08)",
                "& .MuiListItemIcon-root": { color: "#f0a06a" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.hint}
              slotProps={{
                primary: { sx: { fontWeight: 650, fontSize: "0.95rem" } },
                secondary: { sx: { color: "rgba(246, 241, 232, 0.42)", fontSize: "0.72rem" } },
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            background: "rgba(255, 250, 243, 0.06)",
            border: "1px solid rgba(255,250,243,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "rgba(246, 241, 232, 0.55)" }}>
              Sessão local
            </Typography>
            <Typography sx={{ fontWeight: 650, fontSize: "0.9rem" }}>Você</Typography>
          </Box>
          <IconButton
            onClick={() => void handleLogout()}
            aria-label="Sair"
            sx={{ color: "#f6f1e8", "&:hover": { bgcolor: "rgba(255,250,243,0.08)" } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: 0,
              bgcolor: "#121917",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              border: 0,
              bgcolor: "#121917",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4.5 },
          pb: { xs: 4, md: 6 },
          pt: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: 1180,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
            position: "sticky",
            top: 12,
            zIndex: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { md: "none" },
                bgcolor: "rgba(255,250,243,0.8)",
                border: "1px solid rgba(23,33,30,0.08)",
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {current?.hint ?? "Organizador"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.6,
              borderRadius: 999,
              bgcolor: "rgba(255,250,243,0.72)",
              border: "1px solid rgba(23,33,30,0.08)",
              backdropFilter: "blur(12px)",
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 650, letterSpacing: "0.04em" }}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Typography>
          </Box>
        </Box>
        <Fade in key={location.pathname} timeout={420}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
