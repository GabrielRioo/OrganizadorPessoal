import { createTheme } from "@mui/material/styles";

const ink = "#17211e";
const cream = "#fffaf3";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6b5a", light: "#3d8f7a", dark: "#13483c", contrastText: "#f7fbf8" },
    secondary: { main: "#e07a3d", light: "#f0a06a", dark: "#b85a22", contrastText: "#fff8f3" },
    background: { default: "#efe8dc", paper: cream },
    success: { main: "#2f8a62" },
    warning: { main: "#c9892a" },
    info: { main: "#3d6f8f" },
    error: { main: "#c4524a" },
    text: { primary: ink, secondary: "#61706a" },
    divider: "rgba(23, 33, 30, 0.1)",
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: '"Outfit", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 680, letterSpacing: "-0.04em" },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 680, letterSpacing: "-0.04em" },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 680, letterSpacing: "-0.035em" },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 680, letterSpacing: "-0.03em" },
    h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 680, letterSpacing: "-0.03em" },
    h6: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 650, letterSpacing: "-0.02em" },
    overline: { fontWeight: 700, letterSpacing: "0.16em", fontSize: "0.72rem" },
    subtitle1: { fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 650, letterSpacing: "0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: ink,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(23, 33, 30, 0.08)",
          borderRadius: 24,
          boxShadow: "0 18px 40px rgba(42, 32, 22, 0.06)",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,250,243,0.92))",
          transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 18,
            bottom: 18,
            width: 3,
            borderRadius: 999,
            background: "linear-gradient(180deg, #e07a3d, #1f6b5a)",
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 22px 48px rgba(42, 32, 22, 0.12)",
            borderColor: "rgba(31, 107, 90, 0.22)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 42,
          boxShadow: "none",
          transition: "transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
          "&:hover": { transform: "translateY(-1px)" },
        },
        contained: {
          backgroundImage: "linear-gradient(135deg, #1f6b5a 0%, #2f8a72 100%)",
          boxShadow: "0 10px 22px rgba(31, 107, 90, 0.22)",
          "&:hover": {
            boxShadow: "0 14px 28px rgba(31, 107, 90, 0.28)",
          },
        },
        outlined: {
          borderColor: "rgba(23, 33, 30, 0.16)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 650,
          borderRadius: 999,
          transition: "transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease",
          "&:hover": { transform: "translateY(-1px)" },
        },
        filled: {
          border: "1px solid rgba(23, 33, 30, 0.06)",
        },
        colorPrimary: {
          backgroundImage: "linear-gradient(135deg, #1f6b5a, #2a8a72)",
          color: "#f7fbf8",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: "transform 0.16s ease, background-color 0.16s ease",
          "&:hover": { transform: "scale(1.06)", bgcolor: "rgba(31, 107, 90, 0.08)" },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: 22,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255, 250, 243, 0.72)",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1f6b5a",
            boxShadow: "0 0 0 4px rgba(31, 107, 90, 0.12)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          border: "1px solid rgba(23, 33, 30, 0.08)",
          boxShadow: "0 32px 70px rgba(28, 24, 18, 0.22)",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,250,243,1))",
        },
      },
    },
  },
});
