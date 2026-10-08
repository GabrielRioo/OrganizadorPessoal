import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RequireAuth } from "./components/RequireAuth";
import { BuyPage } from "./pages/Buy";
import { CountdownsPage } from "./pages/Countdowns";
import { DashboardPage } from "./pages/Dashboard";
import { GamesPage } from "./pages/Games";
import { LoginPage } from "./pages/Login";
import { MediaPage } from "./pages/Media";
import { PomodoroPage } from "./pages/Pomodoro";
import { ProjectsPage } from "./pages/Projects";
import { AccessPage } from "./pages/Access";
import { TasksPage } from "./pages/Tasks";
import { TravelPage } from "./pages/Travel";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/countdowns" element={<CountdownsPage />} />
          <Route path="/acessos" element={<AccessPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
