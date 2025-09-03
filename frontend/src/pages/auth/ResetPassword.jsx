// src/pages/auth/ResetPassword.jsx
import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";

import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  LinearProgress,
  Link,
  CircularProgress,
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

/* ---------- Champs & Bouton néon ---------- */
const fieldBg = "rgba(17,21,33,.55)";
const textCol = "#E6E6F0";

const NeonField = styled(TextField)({
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
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol,
    borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },
});

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

/* ---------- Règles backend ---------- */
const rules = [
  { key: "len",  label: "Au moins 8 caractères",  test: (v) => v.length >= 8 },
  { key: "up",   label: "Une majuscule (A-Z)",     test: (v) => /[A-Z]/.test(v) },
  { key: "low",  label: "Une minuscule (a-z)",     test: (v) => /[a-z]/.test(v) },
  { key: "num",  label: "Un chiffre (0-9)",        test: (v) => /\d/.test(v) },
  { key: "spec", label: "Un caractère spécial",    test: (v) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(v) },
];

function strength(v) {
  return rules.reduce((acc, r) => acc + (r.test(v) ? 1 : 0), 0); // 0..5
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const score = useMemo(() => strength(pwd), [pwd]);
  const match = confirm.length > 0 && pwd === confirm;
  const allRulesOk = score === rules.length;

  const canSubmit = allRulesOk && match && !loading && !!token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!token) return setError("Token manquant.");
    if (!allRulesOk) return setError("Le mot de passe ne respecte pas toutes les règles.");
    if (!match) return setError("Les mots de passe ne correspondent pas.");

    try {
      setLoading(true);
      const res = await api.post("/auth/reset", { token, newPassword: pwd });
      setMsg(res.data?.message || "Mot de passe réinitialisé avec succès.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Lien invalide ou mot de passe non conforme.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout compact>
        <Paper
          elevation={8}
          sx={{
            p: 2.25,
            borderRadius: 2,
            bgcolor: "rgba(13,17,28,.6)",
            border: "1px solid rgba(124,58,237,.22)",
            textAlign: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box component="img" src={logo} alt="Ask4Skill" sx={{ height: 34, filter: "drop-shadow(0 0 12px rgba(124,58,237,.4))" }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Token manquant</Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Le lien de réinitialisation est invalide. Reprends la procédure.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/forgot" variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "rgba(124,58,237,.45)" }}>
                Refaire la demande
              </Button>
              <Button component={RouterLink} to="/login" variant="contained" sx={{ textTransform: "none", borderRadius: 2,
                background: "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)" }}>
                Se connecter
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout compact>
      <Stack spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box component="img" src={logo} alt="Ask4Skill" sx={{ height: 34, filter: "drop-shadow(0 0 12px rgba(124,58,237,.4))" }} />
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
          Réinitialiser le mot de passe
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
          boxShadow: "0 10px 30px rgba(0,0,0,.55), inset 0 0 30px rgba(124,58,237,.06)",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={1.25}>
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

            {msg && (
              <Box
                sx={{
                  bgcolor: "rgba(34,197,94,.18)",
                  border: "1px solid rgba(34,197,94,.35)",
                  color: "#d1fae5",
                  px: 1.25,
                  py: 0.6,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 12.5,
                  boxShadow: "0 8px 22px rgba(16,185,129,.25)",
                  textAlign: "center",
                }}
              >
                {msg}
              </Box>
            )}

            {/* Mot de passe */}
            <Box>
              <NeonField
                fullWidth
                type={showPwd ? "text" : "password"}
                label="Nouveau mot de passe"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="new-password"
                placeholder="Min. 8 caractères, 1 maj, 1 min, 1 chiffre, 1 spécial"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((s) => !s)} edge="end" size="small">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <LinearProgress
                variant="determinate"
                value={(score / rules.length) * 100}
                sx={{
                  height: 5,
                  borderRadius: 999,
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,.08)",
                  "& .MuiLinearProgress-bar": {
                    background:
                      score <= 2
                        ? "linear-gradient(90deg,#ef4444,#f59e0b)"
                        : "linear-gradient(90deg,#22c55e,#22D3EE)",
                  },
                }}
              />
            </Box>

            {/* Confirmation */}
            <NeonField
              fullWidth
              type={showConfirm ? "text" : "password"}
              label="Confirmer le mot de passe"
              placeholder="Confirme ton mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirm.length > 0 && !match}
              helperText={
                confirm.length > 0 && !match ? "Les mots de passe ne correspondent pas." : " "
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {confirm && match ? (
                      <CheckCircleOutline fontSize="small" />
                    ) : (
                      <Lock fontSize="small" />
                    )}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* ✅ CHECKLIST déplacée sous les deux inputs */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: -0.25, mb: 0.25, flexWrap: "wrap", justifyContent: "center" }}
            >
              {rules.map((r) => {
                const ok = r.test(pwd);
                return (
                  <Stack
                    key={r.key}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ opacity: ok ? 1 : 0.8 }}
                  >
                    {ok ? (
                      <CheckCircleOutline sx={{ fontSize: 16, color: "#22c55e" }} />
                    ) : (
                      <ErrorOutline sx={{ fontSize: 16, color: "#f59e0b" }} />
                    )}
                    <Typography variant="caption">{r.label}</Typography>
                  </Stack>
                );
              })}
            </Stack>

            <NeonButton
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: "white" }} /> : null}
            >
              {loading ? "Mise à jour…" : "Réinitialiser le mot de passe"}
            </NeonButton>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 0.25 }}>
              Tu te rappelles de ton mot de passe ?{" "}
              <Link component={RouterLink} to="/login" underline="hover">
                Se connecter
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </AuthLayout>
  );
}
