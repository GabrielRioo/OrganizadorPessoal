import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env, isProduction } from "./env.js";
import { requireAuth, requireOwner, errorHandler } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { gamesRouter } from "./routes/games.js";
import { mediaRouter } from "./routes/media.js";
import { travelsRouter } from "./routes/travels.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { countdownsRouter } from "./routes/countdowns.js";
import { pomodoroRouter } from "./routes/pomodoro.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { buyItemsRouter } from "./routes/buyItems.js";
import { catalogRouter } from "./routes/catalog.js";
import { accessPasswordsRouter } from "./routes/accessPasswords.js";

const app = express();

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: isProduction ? false : env.clientOrigin,
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/catalog", requireAuth, catalogRouter);
app.use("/api/games", requireAuth, gamesRouter);
app.use("/api/media", requireAuth, mediaRouter);
app.use("/api/travels", requireAuth, travelsRouter);
app.use("/api/projects", requireAuth, projectsRouter);
app.use("/api/tasks", requireAuth, tasksRouter);
app.use("/api/countdowns", requireAuth, countdownsRouter);
app.use("/api/pomodoro-sessions", requireAuth, pomodoroRouter);
app.use("/api/buy-items", requireAuth, buyItemsRouter);
app.use("/api/access-passwords", requireAuth, requireOwner, accessPasswordsRouter);

app.use(errorHandler);

export default app;
