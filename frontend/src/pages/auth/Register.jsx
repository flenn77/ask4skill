// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";

import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  LinearProgress,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Person,
  AlternateEmail,
  Lock,
  Phone,
  CalendarMonth,
  Wc,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

/* ---------- Champs & Bouton néon + fix autofill ---------- */
const fieldBg = "rgba(17,21,33,.55)";
const textCol = "#E6E6F0";

/** IMPORTANT: valeurs conformes à l'ENUM MySQL */
const SEXE_OPTIONS = [
  { value: "H", label: "Homme" },
  { value: "F", label: "Femme" },
  { value: "Autre", label: "Autre" },
  { value: "Non spécifié", label: "Non spécifié" },
];

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
  "& .MuiSelect-select": {
    height: "44px !important",
    display: "flex",
    alignItems: "center",
    padding: "12px 12px",
  },

  // Neutralise le fond d'autofill (Chrome/Safari)
  "& input:-webkit-autofill, & .MuiSelect-select:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol,
    caretColor: textCol,
    borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },

  "& input[type='date']": { paddingRight: 12 },
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

/* ---------- Scoring du mot de passe ---------- */
function scorePassword(pwd) {
  let s = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd)) s++;
  return Math.min(s, 5);
}

export default function Register() {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    pseudo: "",
    email: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: "",
    telephone: "",
    date_naissance: "",
    sexe: "Non spécifié", // valeur ENUM par défaut
  });
  const [voirPwd, setVoirPwd] = useState(false);
  const [voirConfirm, setVoirConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.mot_de_passe !== form.confirmation_mot_de_passe) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await api.post("/auth/register", {
        prenom: form.prenom,
        nom: form.nom,
        pseudo: form.pseudo,
        email: form.email,
        password: form.mot_de_passe, // le backend attend 'password'
        telephone: form.telephone,
        date_naissance: form.date_naissance,
        sexe: form.sexe, // => 'H' | 'F' | 'Autre' | 'Non spécifié'
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  const pwdScore = scorePassword(form.mot_de_passe);
  const pwdColors = ["#ef4444", "#f59e0b", "#22c55e", "#22D3EE", "#A78BFA"];
  const confirmMismatch =
    form.confirmation_mot_de_passe.length > 0 &&
    form.mot_de_passe !== form.confirmation_mot_de_passe;

  return (
    <AuthLayout compact>
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
          Crée ton compte
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
        }}
      >
        <form onSubmit={handleRegister} noValidate>
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
                }}
              >
                {error}
              </Box>
            )}

            {/* ---------- GRID : ordre demandé ---------- */}
            <Box
              sx={{
                display: "grid",
                gap: 1.25,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gridTemplateAreas: {
                  xs: `
                    "prenom"
                    "nom"
                    "pseudo"
                    "telephone"
                    "date_naissance"
                    "sexe"
                    "email"
                    "password"
                    "confirm"
                  `,
                  sm: `
                    "prenom nom"
                    "pseudo telephone"
                    "date_naissance sexe"
                    "email email"
                    "password confirm"
                  `,
                },
              }}
            >
              {/* Prénom - Nom */}
              <NeonField
                sx={{ gridArea: "prenom" }}
                fullWidth
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Ex. Yani"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <NeonField
                sx={{ gridArea: "nom" }}
                fullWidth
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex. Haouili"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Pseudo - Téléphone */}
              <NeonField
                sx={{ gridArea: "pseudo" }}
                fullWidth
                label="Pseudo"
                name="pseudo"
                value={form.pseudo}
                onChange={handleChange}
                placeholder="Ex. NeoSkill"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <NeonField
                sx={{ gridArea: "telephone" }}
                fullWidth
                type="tel"
                inputMode="tel"
                label="Téléphone"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="+33…"
                autoComplete="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Date de naissance - Sexe */}
              <NeonField
                sx={{ gridArea: "date_naissance" }}
                fullWidth
                type="date"
                label="Date de naissance"
                name="date_naissance"
                value={form.date_naissance}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <NeonField
                sx={{ gridArea: "sexe" }}
                fullWidth
                select
                label="Sexe"
                name="sexe"
                value={form.sexe}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Wc fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: "rgba(17,21,33,.9)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(124,58,237,.25)",
                      },
                    },
                  },
                }}
              >
                {SEXE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} dense>
                    {opt.label}
                  </MenuItem>
                ))}
              </NeonField>

              {/* Email (plein largeur) */}
              <NeonField
                sx={{ gridArea: "email" }}
                fullWidth
                type="email"
                label="Adresse e-mail"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="exemple@mail.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmail fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Mot de passe - Confirmation */}
              <Box sx={{ gridArea: "password" }}>
                <Tooltip title="Force du mot de passe" placement="top" arrow>
                  <Box>
                    <NeonField
                      fullWidth
                      type={voirPwd ? "text" : "password"}
                      label="Mot de passe"
                      name="mot_de_passe"
                      value={form.mot_de_passe}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Min. 8 caractères"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setVoirPwd((s) => !s)}
                              edge="end"
                              size="small"
                            >
                              {voirPwd ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(scorePassword(form.mot_de_passe) / 5) * 100}
                      sx={{
                        height: 5,
                        borderRadius: 999,
                        mt: 0.5,
                        bgcolor: "rgba(255,255,255,.08)",
                        "& .MuiLinearProgress-bar": {
                          background: `linear-gradient(90deg, ${
                            pwdColors[Math.max(0, scorePassword(form.mot_de_passe) - 1)]
                          }, #22D3EE)`,
                        },
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>

              <NeonField
                sx={{ gridArea: "confirm" }}
                fullWidth
                type={voirConfirm ? "text" : "password"}
                label="Confirme ton mot de passe"
                name="confirmation_mot_de_passe"
                value={form.confirmation_mot_de_passe}
                onChange={handleChange}
                error={
                  form.confirmation_mot_de_passe.length > 0 &&
                  form.mot_de_passe !== form.confirmation_mot_de_passe
                }
                helperText={
                  form.confirmation_mot_de_passe.length > 0 &&
                  form.mot_de_passe !== form.confirmation_mot_de_passe
                    ? "Les mots de passe ne correspondent pas."
                    : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {form.confirmation_mot_de_passe &&
                      form.mot_de_passe === form.confirmation_mot_de_passe ? (
                        <CheckCircleOutline fontSize="small" />
                      ) : (
                        <Lock fontSize="small" />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setVoirConfirm((s) => !s)}
                        edge="end"
                        size="small"
                      >
                        {voirConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <NeonButton
              type="submit"
              variant="contained"
              disabled={
                !form.mot_de_passe ||
                !form.confirmation_mot_de_passe ||
                form.mot_de_passe !== form.confirmation_mot_de_passe
              }
            >
              S’inscrire
            </NeonButton>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 0.25 }}>
              Déjà inscrit ?{" "}
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
