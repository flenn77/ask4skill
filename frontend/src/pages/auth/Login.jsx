// src/pages/auth/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Link,
  InputAdornment,
  Divider,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

/* ============== Champs & bouton néon + FIX AUTOFILL ============== */
const fieldBg = "rgba(17,21,33,.55)";
const textCol = "#E6E6F0";

const NeonFieldWrapper = styled("div")(() => ({
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
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol,
    caretColor: textCol,
    borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },
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
}));

const NeonTextField = (props) => (
  <NeonFieldWrapper>
    <TextField fullWidth size="small" {...props} />
  </NeonFieldWrapper>
);

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
  transition: "all .2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 14px 40px rgba(124,58,237,.42), 0 0 26px rgba(34,211,238,.3)",
  },
});

/* helpers */
const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function Login() {
  const [email, setEmail] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const canSubmit = isValidEmail(email) && password.length > 0 && !submitting;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      await login(res.data.token);
      navigate("/profile");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 403
          ? "Veuillez confirmer votre adresse e-mail."
          : "Erreur de connexion");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout compact>
      {/* header + logo compact */}
      <Stack spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
        <Box
          component="img"
          src={logo}
          alt="Ask4Skill"
          sx={{
            height: 42,
            filter: "drop-shadow(0 0 18px rgba(124,58,237,.55))",
            userSelect: "none",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: ".6px",
            background: "linear-gradient(90deg,#A78BFA,#22D3EE)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow:
              "0 8px 28px rgba(124,58,237,.45), 0 0 14px rgba(0,229,255,.25)",
          }}
        >
          Accès sécurisé
        </Typography>
        <Typography sx={{ opacity: 0.8, fontSize: 13, textAlign: "center" }}>
          Bienvenue dans ton espace — interface néon activée.
        </Typography>
      </Stack>

      {/* carte compacte */}
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: "rgba(13,17,28,.6)",
          border: "1px solid rgba(124,58,237,.22)",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.55), inset 0 0 30px rgba(124,58,237,.06)",
          backdropFilter: "blur(8px)",
        }}
      >
        <form onSubmit={handleLogin} noValidate>
          <Stack spacing={1.5}>
            {error && (
              <Box
                sx={{
                  bgcolor: "error.main",
                  color: "#fff",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: "0 10px 30px rgba(244,63,94,.35)",
                }}
              >
                {error}
              </Box>
            )}

            <NeonTextField
              type="email"
              label="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="ton@email.com"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <NeonTextField
              type={showPwd ? "text" : "password"}
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd((s) => !s)}
                      edge="end"
                      size="small"
                      aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <NeonButton
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : null
              }
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </NeonButton>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 0.5 }}
            >
              <Link component={RouterLink} to="/forgot" underline="hover">
                Mot de passe oublié ?
              </Link>
              <Link component={RouterLink} to="/register" underline="hover">
                Créer un compte
              </Link>
            </Stack>

            <Divider flexItem sx={{ my: 0.5, opacity: 0.6 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                ou
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                disabled
                sx={{
                  borderRadius: 12,
                  color: textCol,
                  borderColor: "rgba(168,139,250,.35)",
                  bgcolor: "rgba(17,21,33,.45)",
                }}
              >
                Google (bientôt)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                disabled
                sx={{
                  borderRadius: 12,
                  color: textCol,
                  borderColor: "rgba(168,139,250,.35)",
                  bgcolor: "rgba(17,21,33,.45)",
                }}
              >
                Discord (bientôt)
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </AuthLayout>
  );
}
