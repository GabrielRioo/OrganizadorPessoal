import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { ApiError } from "../services/api";
import { authService } from "../services/authService";

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "unauthenticated">("loading");

  const check = useCallback(async () => {
    try {
      await authService.me();
      setStatus("ok");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
