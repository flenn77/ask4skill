// src/pages/auth/ConfirmEmail.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  MarkEmailRead,
} from "@mui/icons-material";

import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!token) {
        if (mounted) {
          setStatus("error");
          setMsg("Token manquant.");
        }
        return;
      }

      try {
        const res = await api.get(`/auth/confirm?token=${token}`);
        if (!mounted) return;
        setStatus("success");
        setMsg(res.data?.message || "E-mail confirmé avec succès.");
      } catch (err) {
        if (!mounted) return;
        const apiError = err.response?.data?.error;

        // Si l'utilisateur est déjà confirmé, on affiche quand même 'succès'
        if (apiError === "Token invalide ou expiré") {
          setStatus("success");
          setMsg("Votre e-mail est déjà confirmé ✅");
        } else {
          setStatus("error");
          setMsg(apiError || "Lien invalide ou expiré.");
        }
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [token]);

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
          Confirmation d’e-mail
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
        {/* Loading */}
        {status === "loading" && (
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,.25) 0%, rgba(34,211,238,.12) 100%)",
                boxShadow:
                  "0 0 24px rgba(124,58,237,.35), inset 0 0 24px rgba(34,211,238,.18)",
              }}
            >
              <CircularProgress size={26} sx={{ color: "#A78BFA" }} />
            </Box>
            <Typography sx={{ opacity: 0.9 }}>
              Vérification du lien en cours…
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Merci de patienter quelques secondes.
            </Typography>
          </Stack>
        )}

        {/* Success */}
        {status === "success" && (
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
              <CheckCircleOutline fontSize="large" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>{msg}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Tu peux maintenant te connecter à ton compte.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                startIcon={<MarkEmailRead />}
                component={RouterLink}
                to="/login"
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
                  boxShadow:
                    "0 10px 32px rgba(124,58,237,.32), 0 0 20px rgba(34,211,238,.22)",
                }}
              >
                Se connecter
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "rgba(124,58,237,.45)",
                }}
              >
                Accueil
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Error */}
        {status === "error" && (
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(239,68,68,.18) 0%, rgba(34,211,238,.08) 100%)",
                boxShadow:
                  "0 0 24px rgba(244,63,94,.35), inset 0 0 24px rgba(34,211,238,.12)",
                color: "#ef4444",
              }}
            >
              <ErrorOutline fontSize="large" />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>{msg}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Le lien semble invalide ou expiré. Demande un nouveau lien depuis
              l’écran d’inscription si besoin.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
                }}
              >
                Revenir à l’inscription
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/login"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "rgba(124,58,237,.45)",
                }}
              >
                Connexion
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>

      <Typography
        variant="caption"
        sx={{ mt: 1.5, textAlign: "center", opacity: 0.6 }}
      >
        Besoin d’aide ?{" "}
        <Link
          href="mailto:support@ask4skill.local"
          underline="hover"
          color="inherit"
        >
          support@ask4skill.local
        </Link>
      </Typography>
    </AuthLayout>
  );
}
