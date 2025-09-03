// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";

import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  AlternateEmail,
  MarkEmailRead,
  SendRounded,
  ErrorOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

/* ---------- Champs & Bouton néon ---------- */
const fieldBg = "rgba(17,21,33,.55)";
const textCol = "#E6E6F0";

const NeonField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: 44,
    background: fieldBg,
    backdropFilter: "blur(8px)",
    borderRadius: 12,
    color: textCol,
    fontSize: 14,
    transition: "all .2s ease",
  },
  "& .MuiInputBase-input": { padding: "12px 12px" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(168,139,250,.22)" },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(168,139,250,.45)",
    boxShadow: "0 0 0 2px rgba(124,58,237,.18)",
  },
  "& label": { color: "rgba(230,230,240,.65)", fontSize: 13 },
  "& label.Mui-focused": {
    color: "#C084FC",
    textShadow: "0 0 8px rgba(192,132,252,.35)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7C3AED",
    boxShadow:
      "0 0 0 3px rgba(124,58,237,.22), inset 0 0 20px rgba(34,211,238,.08)",
  },
  "& .MuiInputAdornment-root, & .MuiSvgIcon-root": {
    color: "rgba(230,230,240,.75)",
  },

  // Neutralise l'autofill bleu/jaune
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol,
    borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },
}));

const NeonButton = styled(Button)({
  height: 46,
  minHeight: 46,
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: ".25px",
  textTransform: "none",
  background:
    "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
  boxShadow: "0 10px 32px rgba(124,58,237,.32), 0 0 20px rgba(34,211,238,.22)",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 14px 40px rgba(124,58,237,.42), 0 0 26px rgba(34,211,238,.3)",
  },
});

/* ---------- Utils ---------- */
const isValidEmail = (v = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!isValidEmail(email)) {
      setError("Merci d’entrer une adresse e-mail valide.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot", { email: email.trim() });
      setMsg(res.data?.message || "Si cet e-mail existe, un lien a été envoyé.");
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout compact>
      {/* Header compact */}
      <Stack spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box
          component="img"
          src={logo}
          alt="Ask4Skill"
          sx={{
            height: 34,
            filter: "drop-shadow(0 0 12px rgba(124,58,237,.4))",
            userSelect: "none",
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            letterSpacing: ".5px",
            background: "linear-gradient(90deg,#A78BFA,#22D3EE)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "0 5px 18px rgba(124,58,237,.35)",
          }}
        >
          Mot de passe oublié
        </Typography>
      </Stack>

      <Paper
        elevation={8}
        sx={{
          p: 2.25,
          borderRadius: 2,
          bgcolor: "rgba(13,17,28,.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(124,58,237,.22)",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.55), inset 0 0 30px rgba(124,58,237,.06)",
          textAlign: "center",
        }}
      >
        {/* État succès */}
        {sent ? (
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(34,197,94,.22) 0%, rgba(34,211,238,.12) 100%)",
                boxShadow:
                  "0 0 24px rgba(16,185,129,.35), inset 0 0 24px rgba(34,211,238,.18)",
                color: "#22c55e",
              }}
            >
              <MarkEmailRead fontSize="large" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>
              {msg || "Si cet e-mail existe, un lien a été envoyé."}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Pense à vérifier tes spams si tu ne vois rien.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
                }}
              >
                Retour à la connexion
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSent(false);
                  setMsg("");
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "rgba(124,58,237,.45)",
                }}
              >
                Renvoyer
              </Button>
            </Stack>
          </Stack>
        ) : (
          // Formulaire
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={1.25} alignItems="stretch">
              {error && (
                <Box
                  sx={{
                    bgcolor: "error.main",
                    color: "#fff",
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 12.5,
                    boxShadow: "0 8px 22px rgba(244,63,94,.35)",
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ErrorOutline fontSize="small" />
                  {error}
                </Box>
              )}

              <Typography sx={{ opacity: 0.8 }}>
                Entre l’adresse e-mail liée à ton compte. On t’enverra un lien
                pour réinitialiser ton mot de passe.
              </Typography>

              <NeonField
                fullWidth
                type="email"
                label="Adresse e-mail"
                placeholder="exemple@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmail fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <NeonButton
                type="submit"
                variant="contained"
                disabled={!isValidEmail(email) || loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} sx={{ color: "white" }} />
                  ) : (
                    <SendRounded />
                  )
                }
              >
                {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
              </NeonButton>

              <Typography variant="body2" sx={{ textAlign: "center", mt: 0.25 }}>
                Tu te souviens de ton mot de passe ?{" "}
                <Link component={RouterLink} to="/login" underline="hover">
                  Se connecter
                </Link>
              </Typography>
            </Stack>
          </form>
        )}
      </Paper>
    </AuthLayout>
  );
}
