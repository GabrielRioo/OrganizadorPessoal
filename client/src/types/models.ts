export type GameStatus = "WISHLIST" | "BACKLOG" | "PLAYING" | "PAUSED" | "PLAYED" | "ABANDONED" | "ONLINE" | "CASUAL" | "EVENTUAL";
export type MediaKind = "MOVIE" | "SERIES" | "ANIME";
export type MediaStatus = "WATCHLIST" | "WATCHING" | "PAUSED" | "WAITING" | "WATCHED";
export type MediaRating = "GOOD" | "OKAY" | "BAD";
export type TravelStatus = "VISITED" | "PLANNING";
export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "PAUSED" | "DONE";
export type TaskKind = "TASK" | "IDEA";
export type TaskStatus = "TODO" | "DOING" | "DONE";

export type Game = {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  queuePosition: number | null;
  notes: string | null;
  coverUrl: string | null;
  playtimeHours: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaItem = {
  id: string;
  title: string;
  kind: MediaKind;
  status: MediaStatus;
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: MediaRating | null;
  genre: string | null;
  watchedOn: string | null;
  notes: string | null;
  coverUrl: string | null;
  year: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Travel = {
  id: string;
  place: string;
  country: string | null;
  status: TravelStatus;
  visitedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  description: string | null;
  deadline: string | null;
  published: boolean;
  monetize: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Countdown = {
  id: string;
  title: string;
  targetDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BuyStatus = "WANT" | "RESEARCHING" | "WAITING_DEAL" | "BOUGHT" | "DROPPED";
export type BuyPriority = "HIGH" | "MEDIUM" | "LOW";
export type BuyCurrency = "BRL" | "USD" | "EUR";

export type BuyLink = {
  url: string;
  label: string | null;
};

export type BuyItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  currentPrice: number | null;
  targetPrice: number | null;
  currency: BuyCurrency;
  quantity: number;
  priority: BuyPriority;
  status: BuyStatus;
  links: BuyLink[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PomodoroSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationMin: number;
  label: string | null;
  createdAt: string;
};

export type DashboardBuyItem = {
  id: string;
  name: string;
  currentPrice: number | null;
  currency: BuyCurrency;
  status: BuyStatus;
};

export type DashboardData = {
  doingTasks: Task[];
  playingGames: Game[];
  watchingMedia: MediaItem[];
  upcomingCountdowns: Countdown[];
  recentPomodoros: PomodoroSession[];
  wantToBuy: DashboardBuyItem[];
};
