import type { ReactNode } from "react";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import WifiIcon from "@mui/icons-material/Wifi";
import type { StatusTone } from "../components/StatusChip";
import type { BuyPriority, BuyStatus, GameStatus, MediaStatus, ProjectStatus, TaskStatus } from "../types/models";

export function gameStatusTone(status: GameStatus): StatusTone {
  if (status === "PLAYING") return "success";
  if (status === "ONLINE") return "info";
  if (status === "CASUAL") return "default";
  if (status === "EVENTUAL") return "default";
  if (status === "PLAYED") return "success";
  if (status === "PAUSED") return "warning";
  if (status === "ABANDONED") return "error";
  if (status === "SHELVED") return "default";
  return "default";
}

export function gameStatusIcon(status: GameStatus): ReactNode {
  if (status === "WISHLIST") return <FavoriteBorderIcon />;
  if (status === "BACKLOG") return <BookmarkBorderIcon />;
  if (status === "PLAYING") return <SportsEsportsIcon />;
  if (status === "PAUSED") return <PauseCircleOutlineIcon />;
  if (status === "PLAYED") return <CheckCircleOutlineIcon />;
  if (status === "ONLINE") return <WifiIcon />;
  if (status === "CASUAL") return <WeekendOutlinedIcon />;
  if (status === "EVENTUAL") return <EventOutlinedIcon />;
  if (status === "SHELVED") return <ArchiveOutlinedIcon />;
  return <CancelOutlinedIcon />;
}

export function mediaStatusTone(status: MediaStatus): StatusTone {
  if (status === "WATCHING") return "info";
  if (status === "WATCHED") return "success";
  if (status === "PAUSED") return "warning";
  return "default";
}

export function projectStatusTone(status: ProjectStatus): StatusTone {
  if (status === "DONE") return "success";
  if (status === "IN_PROGRESS") return "info";
  if (status === "PAUSED") return "warning";
  return "default";
}

export function taskStatusTone(status: TaskStatus): StatusTone {
  if (status === "DONE") return "success";
  if (status === "DOING") return "info";
  return "default";
}

export function buyStatusTone(status: BuyStatus): StatusTone {
  if (status === "BOUGHT") return "success";
  if (status === "WAITING_DEAL") return "warning";
  if (status === "RESEARCHING") return "info";
  if (status === "DROPPED") return "error";
  return "default";
}

export function buyPriorityTone(priority: BuyPriority): StatusTone {
  if (priority === "HIGH") return "error";
  if (priority === "LOW") return "default";
  return "warning";
}
