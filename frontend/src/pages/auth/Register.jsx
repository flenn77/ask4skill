// src/pages/auth/Register.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";

import {
  Box, Paper, Stack, Typography, TextField, Button, Link,
  InputAdornment, IconButton, LinearProgress, MenuItem, Tooltip,
  CircularProgress
} from "@mui/material";
import {
  Person, AlternateEmail, Lock, Phone, CalendarMonth, Wc,
  Visibility, VisibilityOff, CheckCircleOutline, ErrorOutline, Public, LocationCity,
  Badge, MilitaryTech, Description as DescriptionIcon, HourglassEmpty
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/logo.png";

/* ---------- UI néon ---------- */
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
  "& .MuiInputBase-multiline": {
    height: "auto",
  },
  "& .MuiInputBase-input": { padding: "12px 12px" },
  "& .MuiInputBase-inputMultiline": { padding: "12px 12px" },
  "& .MuiSelect-select": {
    height: "44px !important",
    display: "flex",
    alignItems: "center",
    padding: "12px 12px",
  },
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
  "& label.Mui-focused": { color: "#C084FC", textShadow: "0 0 8px rgba(192,132,252,.35)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7C3AED",
    boxShadow: "0 0 0 3px rgba(124,58,237,.22), inset 0 0 20px rgba(34,211,238,.08)",
  },
  "& .MuiInputAdornment-root, & .MuiSvgIcon-root": { color: "rgba(230,230,240,.75)" },
});

const NeonButton = styled(Button)({
  height: 46,
  minHeight: 46,
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: ".25px",
  textTransform: "none",
  background: "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
  boxShadow: "0 10px 32px rgba(124,58,237,.32), 0 0 20px rgba(34,211,238,.22)",
  transition: "all .2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 14px 40px rgba(124,58,237,.42), 0 0 26px rgba(34,211,238,.3)",
  },
});

/* ---------- Helpers & règles alignées au backend ---------- */
const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isISO2 = (v = "") => /^[A-Z]{2}$/.test(v.trim());
const TEL_RE = /^\+?\d{6,20}$/;
const PSEUDO_RE = /^[a-zA-Z0-9_]{3,32}$/;
const MIN_AGE = 13;
const MAX_AGE = 100;

function ageFromDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return null;
  const [y, m, d] = yyyy_mm_dd.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const hasHadBirthday =
    today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hasHadBirthday) age -= 1;
  return age;
}

// Règles de complexité = celles du backend (8+, maj, min, chiffre, spécial)
const PWD_RULES = [
  { key: "len",  label: "Au moins 8 caractères",  test: (v) => v.length >= 8 },
  { key: "up",   label: "Une majuscule (A-Z)",     test: (v) => /[A-Z]/.test(v) },
  { key: "low",  label: "Une minuscule (a-z)",     test: (v) => /[a-z]/.test(v) },
  { key: "num",  label: "Un chiffre (0-9)",        test: (v) => /\d/.test(v) },
  { key: "spec", label: "Un caractère spécial",    test: (v) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(v) },
];

function scorePassword(pwd) {
  return PWD_RULES.reduce((acc, r) => acc + (r.test(pwd) ? 1 : 0), 0); // 0..5
}

export default function Register() {
  /* ---------- refs dynamiques ---------- */
  const [roles, setRoles] = useState([]);     // [{id, nom}]
  const [sexes, setSexes] = useState([]);     // [{id, label}]
  const [levels, setLevels] = useState([]);   // [{id, label}]
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refError, setRefError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRefs(true);
        const [r1, r2, r3] = await Promise.all([
          api.get("/auth/ref/roles"),
          api.get("/auth/ref/sexes"),
          api.get("/auth/ref/levels"),
        ]);
        if (!mounted) return;
        const onlyUserFacing = (r1.data || []).filter((r) =>
          ["JOUEUR", "COACH"].includes(r.nom)
        );
        setRoles(onlyUserFacing);
        setSexes(r2.data || []);
        setLevels(r3.data || []);
      } catch {
        if (!mounted) return;
        setRefError("Impossible de charger les références (roles/sexes/levels).");
      } finally {
        if (mounted) setLoadingRefs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- formulaire ---------- */
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    pseudo: "",
    email: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: "",
    telephone: "",
    date_naissance: "",
    role_id: "",
    sexe_id: "",
    niveau_id: "",
    pays: "",
    ville: "",
    description: "",
  });

  // Vérification pseudo (format + disponibilité)
  const [pseudoState, setPseudoState] = useState({
    checking: false,
    available: null, // true|false|null
  });
  const pseudoTimer = useRef(null);

  const [voirPwd, setVoirPwd] = useState(false);
  const [voirConfirm, setVoirConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Validations dérivées
  const pwdScore = useMemo(() => scorePassword(form.mot_de_passe), [form.mot_de_passe]);
  const allPwdRulesOk = useMemo(
    () => PWD_RULES.every((r) => r.test(form.mot_de_passe)),
    [form.mot_de_passe]
  );
  const confirmMismatch =
    form.confirmation_mot_de_passe.length > 0 &&
    form.mot_de_passe !== form.confirmation_mot_de_passe;

  const pseudoFormatOk = useMemo(
    () => PSEUDO_RE.test((form.pseudo || "").trim()),
    [form.pseudo]
  );

  const telOk = useMemo(
    () => !form.telephone || TEL_RE.test(form.telephone),
    [form.telephone]
  );

  const age = useMemo(() => ageFromDate(form.date_naissance || ""), [form.date_naissance]);
  const ageOk =
    !form.date_naissance ||
    (age !== null && age >= MIN_AGE && age <= MAX_AGE);

  // Debounce + call /auth/validate/pseudo
  useEffect(() => {
    const value = (form.pseudo || "").trim();
    if (!value || !pseudoFormatOk) {
      setPseudoState({ checking: false, available: null });
      return;
    }
    if (pseudoTimer.current) clearTimeout(pseudoTimer.current);
    setPseudoState((s) => ({ ...s, checking: true, available: null }));
    pseudoTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/auth/validate/pseudo", { params: { pseudo: value } });
        setPseudoState({ checking: false, available: !!data?.available });
      } catch {
        setPseudoState({ checking: false, available: null });
      }
    }, 500);
    return () => pseudoTimer.current && clearTimeout(pseudoTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pseudo, pseudoFormatOk]);

  const canSubmit =
    !submitting &&
    !loadingRefs &&
    form.prenom.trim() &&
    form.nom.trim() &&
    form.pseudo.trim() &&
    pseudoFormatOk &&
    pseudoState.available !== false &&
    !pseudoState.checking &&
    isValidEmail(form.email) &&
    allPwdRulesOk &&
    !confirmMismatch &&
    (!form.pays || isISO2(form.pays.toUpperCase())) &&
    telOk &&
    ageOk &&
    !!form.role_id;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        pseudo: form.pseudo.trim(),
        email: form.email.trim(),
        password: form.mot_de_passe,
        role_id: Number(form.role_id),
        telephone: form.telephone?.trim() || undefined,
        date_naissance: form.date_naissance || undefined,
        sexe_id: form.sexe_id ? Number(form.sexe_id) : null,
        niveau_id: form.niveau_id ? Number(form.niveau_id) : null,
        pays: form.pays ? form.pays.toUpperCase() : undefined,
        ville: form.ville?.trim() || undefined,
        description: form.description?.trim() || undefined,
      };

      await api.post("/auth/register", payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

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
        {loadingRefs ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
            <CircularProgress />
            <Typography>
              Chargement des listes (rôles, sexes, niveaux)…
            </Typography>
          </Stack>
        ) : (
          <form onSubmit={handleRegister} noValidate>
            <Stack spacing={1.25}>
              {(refError || error) && (
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
                  {refError || error}
                </Box>
              )}

              {/* ---------- Grid (ordre demandé) ---------- */}
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
                      "role_id"
                      "niveau_id"
                      "sexe_id"
                      "telephone"
                      "date_naissance"
                      "pays"
                      "ville"
                      "description"
                      "email"
                      "password"
                      "confirm"
                    `,
                    sm: `
                      "prenom nom"
                      "pseudo role_id"
                      "niveau_id sexe_id"
                      "telephone date_naissance"
                      "pays ville"
                      "description description"
                      "email email"
                      "password confirm"
                    `,
                  },
                }}
              >
                {/* Prénom - Nom */}
                <NeonField
                  sx={{ gridArea: "prenom" }}
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

                {/* Pseudo - Rôle */}
                <NeonField
                  sx={{ gridArea: "pseudo" }}
                  label="Pseudo"
                  name="pseudo"
                  value={form.pseudo}
                  onChange={handleChange}
                  placeholder="Ex. NeoSkill"
                  error={
                    (!!form.pseudo && !pseudoFormatOk) ||
                    pseudoState.available === false
                  }
                  helperText={
                    (!!form.pseudo && !pseudoFormatOk) ? "3–32 car. alphanumériques ou _"
                    : (pseudoState.available === false) ? "Ce pseudo est déjà pris"
                    : (pseudoState.available && form.pseudo) ? "Disponible"
                    : " "
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {pseudoState.checking ? (
                          <Tooltip title="Vérification…">
                            <HourglassEmpty fontSize="small" />
                          </Tooltip>
                        ) : pseudoState.available === true && form.pseudo ? (
                          <Tooltip title="Disponible">
                            <CheckCircleOutline color="success" fontSize="small" />
                          </Tooltip>
                        ) : pseudoState.available === false ? (
                          <Tooltip title="Déjà pris">
                            <ErrorOutline color="error" fontSize="small" />
                          </Tooltip>
                        ) : null}
                      </InputAdornment>
                    ),
                  }}
                />

                <NeonField
                  sx={{ gridArea: "role_id" }}
                  select
                  label="Rôle"
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) return "Rôle";
                      const r = roles.find(
                        (x) => String(x.id) === String(selected)
                      );
                      return r ? r.nom : selected;
                    },
                  }}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={String(r.id)} dense>
                      {r.nom}
                    </MenuItem>
                  ))}
                </NeonField>

                {/* Niveau */}
                <NeonField
                  sx={{ gridArea: "niveau_id" }}
                  select
                  label="Niveau"
                  name="niveau_id"
                  value={form.niveau_id}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MilitaryTech fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) return "Niveau";
                      const l = levels.find(
                        (x) => String(x.id) === String(selected)
                      );
                      return l ? l.label : selected;
                    },
                  }}
                >
                  <MenuItem value="" dense>
                    Non précisé
                  </MenuItem>
                  {levels.map((l) => (
                    <MenuItem key={l.id} value={String(l.id)} dense>
                      {l.label}
                    </MenuItem>
                  ))}
                </NeonField>

                {/* Sexe */}
                <NeonField
                  sx={{ gridArea: "sexe_id" }}
                  select
                  label="Sexe"
                  name="sexe_id"
                  value={form.sexe_id}
                  onChange={handleChange}
                  SelectProps={{ displayEmpty: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Wc fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="" dense>
                    Non spécifié
                  </MenuItem>
                  {sexes.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)} dense>
                      {s.label}
                    </MenuItem>
                  ))}
                </NeonField>

                {/* Téléphone - Date de naissance */}
                <NeonField
                  sx={{ gridArea: "telephone" }}
                  type="tel"
                  inputMode="tel"
                  label="Téléphone"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+33…"
                  autoComplete="tel"
                  error={!!form.telephone && !telOk}
                  helperText={form.telephone && !telOk ? "Format attendu: +336..., 6–20 chiffres" : " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <NeonField
                  sx={{ gridArea: "date_naissance" }}
                  type="date"
                  label="Date de naissance"
                  name="date_naissance"
                  value={form.date_naissance}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="jj/mm/aaaa"
                  error={!ageOk}
                  helperText={!ageOk ? `Âge autorisé: ${MIN_AGE}–${MAX_AGE} ans` : " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Pays - Ville */}
                <NeonField
                  sx={{ gridArea: "pays" }}
                  label="Pays (ISO2)"
                  name="pays"
                  value={form.pays}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pays: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="FR, BE, CH…"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Public fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    form.pays && !isISO2(form.pays)
                      ? "Code pays ISO2 attendu (ex: FR)"
                      : " "
                  }
                  error={!!form.pays && !isISO2(form.pays)}
                />
                <NeonField
                  sx={{ gridArea: "ville" }}
                  label="Ville"
                  name="ville"
                  value={form.ville}
                  onChange={handleChange}
                  placeholder="Paris…"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Description (avec icône) */}
                <NeonField
                  sx={{ gridArea: "description" }}
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Parle un peu de toi (objectif, jeux, dispo…)"
                  multiline
                  minRows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Adresse e-mail */}
                <NeonField
                  sx={{ gridArea: "email" }}
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

                {/* Mot de passe / Confirmation */}
                <Box sx={{ gridArea: "password" }}>
                  <Tooltip title="Force du mot de passe" placement="top" arrow>
                    <Box>
                      <NeonField
                        type={voirPwd ? "text" : "password"}
                        label="Mot de passe"
                        name="mot_de_passe"
                        value={form.mot_de_passe}
                        onChange={handleChange}
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
                        value={(pwdScore / 5) * 100}
                        sx={{
                          height: 5,
                          borderRadius: 999,
                          mt: 0.5,
                          bgcolor: "rgba(255,255,255,.08)",
                          "& .MuiLinearProgress-bar": {
                            background:
                              pwdScore <= 2
                                ? "linear-gradient(90deg,#ef4444,#f59e0b)"
                                : "linear-gradient(90deg,#22c55e,#22D3EE)",
                          },
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Box>

                <NeonField
                  sx={{ gridArea: "confirm" }}
                  type={voirConfirm ? "text" : "password"}
                  label="Confirme le mot de passe"
                  name="confirmation_mot_de_passe"
                  value={form.confirmation_mot_de_passe}
                  onChange={handleChange}
                  placeholder="Re-saisis le mot de passe"
                  error={confirmMismatch}
                  helperText={
                    confirmMismatch ? "Les mots de passe ne correspondent pas." : " "
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {form.confirmation_mot_de_passe && !confirmMismatch ? (
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

              {/* Checklist des règles de mot de passe (alignée backend) */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: -0.25, mb: 0.25, flexWrap: "wrap", justifyContent: "center" }}
              >
                {PWD_RULES.map((r) => {
                  const ok = r.test(form.mot_de_passe);
                  return (
                    <Stack
                      key={r.key}
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ opacity: ok ? 1 : 0.9 }}
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
                startIcon={
                  submitting ? <CircularProgress size={16} sx={{ color: "white" }} /> : null
                }
              >
                {submitting ? "Création…" : "S’inscrire"}
              </NeonButton>

              <Typography variant="body2" sx={{ textAlign: "center", mt: 0.25 }}>
                Déjà inscrit ?{" "}
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
