// src/pages/Profile.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Person,
  AlternateEmail,
  Phone,
  CalendarMonth,
  Wc,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../layouts/AuthLayout";
import logo from "../assets/logo.png";

/* ---------- Styled: champs & bouton néon ---------- */
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
  "& input::placeholder": { color: "rgba(230,230,240,.55)" },

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

const SEXE_OPTIONS = [
  { value: "H", label: "Homme" },
  { value: "F", label: "Femme" },
  { value: "Autre", label: "Autre" },
  { value: "Non spécifié", label: "Non spécifié" },
];

/* ---------- Utils ---------- */
const normalizeDateInput = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d)) return "";
  // Evite les décalages tz en gardant yyyy-mm-dd
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ---------- Page ---------- */
export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  useEffect(() => {
    if (user) {
      // On prépare le formulaire avec les mêmes clés que l’API
      setForm({
        prenom: user.prenom || "",
        nom: user.nom || "",
        pseudo: user.pseudo || "",
        telephone: user.telephone || "",
        date_naissance: normalizeDateInput(user.date_naissance) || "",
        sexe: user.sexe || "Non spécifié",
        email: user.email || "",
        is_email_verified: !!user.is_email_verified,
      });
    }
  }, [user]);

  const emailChip = useMemo(() => {
    if (!form) return null;
    return form.is_email_verified ? (
      <Chip
        label="Email vérifié"
        color="success"
        size="small"
        sx={{ fontWeight: 700 }}
      />
    ) : (
      <Chip
        label="Email non vérifié"
        color="warning"
        size="small"
        sx={{ fontWeight: 700 }}
      />
    );
  }, [form]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      // Envoie uniquement les champs éditables côté profil
      const payload = {
        prenom: form.prenom,
        nom: form.nom,
        pseudo: form.pseudo,
        telephone: form.telephone,
        date_naissance: form.date_naissance || null,
        sexe: form.sexe,
      };
      const res = await api.patch("/auth/me", payload);
      // selon ton API: res.data.data ou res.data
      const updated = res.data?.data || res.data || payload;
      setUser({ ...(user || {}), ...updated });
      setSnack({
        open: true,
        type: "success",
        msg: "Profil mis à jour !",
      });
    } catch (err) {
      setSnack({
        open: true,
        type: "error",
        msg: err.response?.data?.error || "Erreur lors de l’enregistrement",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      pseudo: user.pseudo || "",
      telephone: user.telephone || "",
      date_naissance: normalizeDateInput(user.date_naissance) || "",
      sexe: user.sexe || "Non spécifié",
      email: user.email || "",
      is_email_verified: !!user.is_email_verified,
    });
  };

  if (!user || !form) {
    return (
      <AuthLayout compact>
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />
          <Typography>Chargement du profil…</Typography>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout compact>
      {/* header */}
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
          Mon profil
        </Typography>
      </Stack>

      {/* carte */}
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
        <Stack spacing={1.5}>
          {/* email en haut + puce statut */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 0.5 }}
          >
            <NeonField
              fullWidth
              label="Adresse e-mail"
              name="email"
              value={form.email}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmail fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {emailChip}
          </Stack>

          <Divider sx={{ opacity: 0.3 }} />

          {/* GRID 2 colonnes responsive */}
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
                `,
                sm: `
                  "prenom nom"
                  "pseudo telephone"
                  "date_naissance sexe"
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
              placeholder="Ex. Yani"
              value={form.prenom}
              onChange={handleChange}
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
              placeholder="Ex. Haouili"
              value={form.nom}
              onChange={handleChange}
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
              placeholder="Ex. NeoSkill"
              value={form.pseudo}
              onChange={handleChange}
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
              placeholder="+33…"
              value={form.telephone}
              onChange={handleChange}
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
          </Box>

          {/* actions */}
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <NeonButton onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Sauvegarder"}
            </NeonButton>
            <Button
              onClick={handleReset}
              variant="outlined"
              sx={{
                height: 46,
                borderRadius: 12,
                borderColor: "rgba(124,58,237,.35)",
                color: "#E6E6F0",
                "&:hover": { borderColor: "#7C3AED" },
              }}
            >
              Réinitialiser
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}
