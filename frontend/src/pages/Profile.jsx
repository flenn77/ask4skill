// src/pages/Profile.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";

import {
  Box, Paper, Stack, Typography, TextField, Button, InputAdornment,
  MenuItem, Chip, Divider, CircularProgress, Snackbar, Alert, Tooltip
} from "@mui/material";
import {
  Person, AlternateEmail, Phone, CalendarMonth, Wc, Public, LocationCity,
  MilitaryTech, Badge, Translate, Description as DescriptionIcon,
  CheckCircleOutline, ErrorOutline, HourglassEmpty
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AuthLayout from "../layouts/AuthLayout";
import logo from "../assets/logo.png";

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
  "& .MuiInputBase-multiline": { height: "auto" },
  "& .MuiInputBase-input": { padding: "12px 12px" },
  "& .MuiInputBase-inputMultiline": { padding: "12px 12px" },
  "& .MuiSelect-select": {
    height: "44px !important", display: "flex", alignItems: "center", padding: "12px 12px",
  },
  "& input:-webkit-autofill, & .MuiSelect-select:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol, caretColor: textCol, borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },
  "& input[type='date']": { paddingRight: 12 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(168,139,250,.22)" },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(168,139,250,.45)", boxShadow: "0 0 0 2px rgba(124,58,237,.18)",
  },
  "& label": { color: "rgba(230,230,240,.65)", fontSize: 13 },
  "& label.Mui-focused": { color: "#C084FC", textShadow: "0 0 8px rgba(192,132,252,.35)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7C3AED", boxShadow: "0 0 0 3px rgba(124,58,237,.22), inset 0 0 20px rgba(34,211,238,.08)"
  },
  "& .MuiInputAdornment-root, & .MuiSvgIcon-root": { color: "rgba(230,230,240,.75)" },
});

const NeonButton = styled(Button)({
  height: 46, minHeight: 46, borderRadius: 12, fontWeight: 800, fontSize: 14, letterSpacing: ".25px",
  textTransform: "none",
  background: "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
  boxShadow: "0 10px 32px rgba(124,58,237,.32), 0 0 20px rgba(34,211,238,.22)",
  transition: "all .2s ease",
  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 14px 40px rgba(124,58,237,.42), 0 0 26px rgba(34,211,238,.3)" },
});

/* ---------- helpers ---------- */
const MIN_AGE = 13;
const MAX_AGE = 100;
const PSEUDO_RE = /^[a-zA-Z0-9_]{3,32}$/;
const TEL_RE = /^\+?\d{6,20}$/;
const isISO2 = (v = "") => /^[A-Z]{2}$/.test(v.trim());
const isLang = (v = "") => /^[a-z]{2}(?:-[A-Z]{2})?$/.test(v.trim());

const normalizeDateInput = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const ageFromDate = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return null;
  const [y, m, d] = yyyy_mm_dd.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const hasHadBirthday =
    today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hasHadBirthday) age -= 1;
  return age;
};

export default function Profile() {
  /* refs dynamiques */
  const [roles, setRoles]   = useState([]);
  const [sexes, setSexes]   = useState([]);
  const [levels, setLevels] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  /* profil */
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const initialRef = useRef(null); // snapshot pour isDirty + id

  /* pseudo availability */
  const [pseudoState, setPseudoState] = useState({
    checking: false,
    available: null, // true|false|null
    msg: "",
  });
  const pseudoTimer = useRef(null);

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data: me }, r1, r2, r3] = await Promise.all([
          api.get("/auth/me"),
          api.get("/auth/ref/roles"),
          api.get("/auth/ref/sexes"),
          api.get("/auth/ref/levels"),
        ]);

        setRoles(r1.data || r1 || []);
        setSexes(r2.data || r2 || []);
        setLevels(r3.data || r3 || []);

        const f = {
          id: me.id,
          prenom: me.prenom || "",
          nom: me.nom || "",
          pseudo: me.pseudo || "",
          telephone: me.telephone || "",
          date_naissance: normalizeDateInput(me.date_naissance) || "",
          sexe_id: me.sexe_id ? String(me.sexe_id) : "",
          pays: me.pays || "",
          ville: me.ville || "",
          langue_principale: me.langue_principale || "",
          niveau_id: me.niveau_id ? String(me.niveau_id) : "",
          description: me.description || "",
          email: me.email || "",
          role_id: me.role_id || null,
          is_email_verified: !!me.is_email_verified,
        };
        setForm(f);
        initialRef.current = f;
      } catch (e) {
        setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Impossible de charger le profil" });
      } finally {
        setLoading(false);
        setLoadingRefs(false);
      }
    })();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* ---- validations côté UI ---- */
  const age = useMemo(() => ageFromDate(form?.date_naissance || ""), [form?.date_naissance]);
  const ageOk =
    form?.date_naissance === "" ||
    (age !== null && age >= MIN_AGE && age <= MAX_AGE);

  const pseudoFormatOk = useMemo(
    () => !!form && PSEUDO_RE.test((form.pseudo || "").trim()),
    [form?.pseudo]
  );

  const telOk = useMemo(
    () => !form?.telephone || TEL_RE.test(form.telephone),
    [form?.telephone]
  );
  const isoOk  = useMemo(() => !form?.pays || isISO2(form.pays), [form?.pays]);
  const langOk = useMemo(() => !form?.langue_principale || isLang(form.langue_principale), [form?.langue_principale]);

  /* ---- vérification d’unicité pseudo (debounce) ---- */
  useEffect(() => {
    if (!form) return;
    const value = (form.pseudo || "").trim();
    // Si identique au pseudo initial → considéré dispo
    if (value && value === (initialRef.current?.pseudo || "")) {
      setPseudoState({ checking: false, available: true, msg: "" });
      return;
    }
    // reset si vide ou format KO
    if (!value || !pseudoFormatOk) {
      setPseudoState({
        checking: false,
        available: null,
        msg: value && !pseudoFormatOk ? "3–32 car. alphanumériques ou _" : "",
      });
      return;
    }

    // debounce
    if (pseudoTimer.current) clearTimeout(pseudoTimer.current);
    setPseudoState((s) => ({ ...s, checking: true, available: null, msg: "" }));

    pseudoTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/auth/validate/pseudo", {
          params: { pseudo: value, exclude_id: initialRef.current?.id },
        });
        setPseudoState({
          checking: false,
          available: !!data?.available,
          msg: data?.available ? "Disponible" : "Déjà pris",
        });
      } catch {
        setPseudoState({ checking: false, available: null, msg: "Vérification impossible" });
      }
    }, 500);

    return () => pseudoTimer.current && clearTimeout(pseudoTimer.current);
  }, [form?.pseudo, pseudoFormatOk]);

  /* ---- payload + isDirty ---- */
  const cleanedPayload = useMemo(() => {
    if (!form) return null;
    return {
      prenom: form.prenom || "",
      nom: form.nom || "",
      pseudo: (form.pseudo || "").trim(),
      telephone: form.telephone || "",
      date_naissance: form.date_naissance || null,
      sexe_id: form.sexe_id ? Number(form.sexe_id) : null,
      pays: form.pays ? form.pays.toUpperCase() : null,
      ville: form.ville || "",
      langue_principale: form.langue_principale || "",
      niveau_id: form.niveau_id ? Number(form.niveau_id) : null,
      description: form.description || "",
    };
  }, [form]);

  const isDirty = useMemo(() => {
    if (!form || !initialRef.current) return false;
    const a = { ...cleanedPayload };
    const b = {
      prenom: initialRef.current.prenom || "",
      nom: initialRef.current.nom || "",
      pseudo: (initialRef.current.pseudo || "").trim(),
      telephone: initialRef.current.telephone || "",
      date_naissance: initialRef.current.date_naissance || null,
      sexe_id: initialRef.current.sexe_id ? Number(initialRef.current.sexe_id) : null,
      pays: initialRef.current.pays ? initialRef.current.pays.toUpperCase() : null,
      ville: initialRef.current.ville || "",
      langue_principale: initialRef.current.langue_principale || "",
      niveau_id: initialRef.current.niveau_id ? Number(initialRef.current.niveau_id) : null,
      description: initialRef.current.description || "",
    };
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [cleanedPayload, form]);

  const canSave =
    !!form &&
    !saving &&
    isoOk &&
    langOk &&
    telOk &&
    ageOk &&
    (form.prenom || "").trim().length >= 1 &&
    (form.nom || "").trim().length >= 1 &&
    pseudoFormatOk &&
    (pseudoState.available !== false) && // pas “pris”
    !pseudoState.checking &&            // pas en cours de check
    isDirty;

  const handleSave = async () => {
    if (!cleanedPayload) return;
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", cleanedPayload);
      const updated = {
        ...initialRef.current,
        ...form,
        ...data,
        date_naissance: normalizeDateInput(data.date_naissance ?? form.date_naissance) || "",
        sexe_id: data.sexe_id ? String(data.sexe_id) : form.sexe_id || "",
        niveau_id: data.niveau_id ? String(data.niveau_id) : form.niveau_id || "",
        pays: (data.pays || form.pays || "").toUpperCase(),
        pseudo: data.pseudo ?? form.pseudo,
      };
      initialRef.current = updated;
      setForm(updated);
      setSnack({ open: true, type: "success", msg: "Profil mis à jour !" });
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Erreur lors de l’enregistrement" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => initialRef.current && setForm(initialRef.current);

  const roleLabel = useMemo(() => {
    const r = roles.find((x) => x.id === form?.role_id);
    return r?.nom || (form?.role_id ? `Rôle #${form.role_id}` : "—");
  }, [roles, form]);

  const emailChip = useMemo(() => {
    if (!form) return null;
    return form.is_email_verified ? (
      <Chip label="Email vérifié" color="success" size="small" sx={{ fontWeight: 700 }} />
    ) : (
      <Chip label="Email non vérifié" color="warning" size="small" sx={{ fontWeight: 700 }} />
    );
  }, [form]);

  if (loading || !form) {
    return (
      <AuthLayout compact>
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress /><Typography>Chargement du profil…</Typography>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout compact>
      {/* Header */}
      <Stack spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box component="img" src={logo} alt="Ask4Skill"
             sx={{ height: 34, filter: "drop-shadow(0 0 12px rgba(124,58,237,.4))", userSelect: "none" }} />
        <Typography variant="subtitle1" sx={{
          fontWeight: 800, letterSpacing: ".5px",
          background: "linear-gradient(90deg,#A78BFA,#22D3EE)",
          WebkitBackgroundClip: "text", color: "transparent",
          textShadow: "0 5px 18px rgba(124,58,237,.35)",
        }}>
          Mon profil
        </Typography>
      </Stack>

      {/* Card */}
      <Paper elevation={8} sx={{
        p: 2.25, borderRadius: 2, bgcolor: "rgba(13,17,28,.6)",
        backdropFilter: "blur(8px)", border: "1px solid rgba(124,58,237,.22)",
        boxShadow: "0 10px 30px rgba(0,0,0,.55), inset 0 0 30px rgba(124,58,237,.06)",
      }}>
        <Stack spacing={1.5}>
          {/* Email + Rôle */}
          <Box sx={{
            display: "grid", gap: 1.25,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gridTemplateAreas: { xs: `"email" "role"`, sm: `"email role"` },
            alignItems: "center",
          }}>
            <Box sx={{ gridArea: "email", display: "flex", gap: 1 }}>
              <NeonField fullWidth label="Adresse e-mail" name="email" value={form.email} disabled
                InputProps={{ startAdornment: <InputAdornment position="start"><AlternateEmail fontSize="small" /></InputAdornment> }} />
              {emailChip}
            </Box>
            <NeonField sx={{ gridArea: "role" }} fullWidth label="Rôle" value={roleLabel} disabled
              InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> }} />
          </Box>

          <Divider sx={{ opacity: 0.3 }} />

          {/* Form grid */}
          <Box sx={{
            display: "grid", gap: 1.25,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gridTemplateAreas: {
              xs: `
                "prenom"
                "nom"
                "pseudo"
                "niveau_id"
                "sexe_id"
                "telephone"
                "date_naissance"
                "pays"
                "ville"
                "description"
                "langue"
              `,
              sm: `
                "prenom nom"
                "pseudo pseudo"
                "niveau_id sexe_id"
                "telephone date_naissance"
                "pays ville"
                "description description"
                "langue langue"
              `,
            },
          }}>
            {/* Prénom - Nom */}
            <NeonField sx={{ gridArea: "prenom" }} label="Prénom" name="prenom"
              placeholder="Ex. Yani" value={form.prenom} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }} />
            <NeonField sx={{ gridArea: "nom" }} label="Nom" name="nom"
              placeholder="Ex. Haouili" value={form.nom} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }} />

            {/* Pseudo (format + disponibilité) */}
            <NeonField
              sx={{ gridArea: "pseudo" }}
              label="Pseudo"
              name="pseudo"
              placeholder="Ex. NeoSkill"
              value={form.pseudo}
              onChange={handleChange}
              error={
                (!!form.pseudo && !pseudoFormatOk) ||
                pseudoState.available === false
              }
              helperText={
                (!!form.pseudo && !pseudoFormatOk) ? "3–32 car. alphanumériques ou _"
                : (pseudoState.available === false) ? "Ce pseudo est déjà pris"
                : (pseudoState.available && form.pseudo !== initialRef.current?.pseudo) ? "Disponible"
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
                    ) : pseudoState.available === true &&
                      form.pseudo !== initialRef.current?.pseudo ? (
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

            {/* Niveau - Sexe */}
            <NeonField sx={{ gridArea: "niveau_id" }} select label="Niveau" name="niveau_id"
              value={form.niveau_id} onChange={handleChange} disabled={loadingRefs}
              InputProps={{ startAdornment: <InputAdornment position="start"><MilitaryTech fontSize="small" /></InputAdornment> }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) return "Niveau";
                  const l = levels.find((x) => String(x.id) === String(selected));
                  return l ? l.label : selected;
                },
              }}>
              <MenuItem value="" dense>Non précisé</MenuItem>
              {levels.map((l) => <MenuItem key={l.id} value={String(l.id)} dense>{l.label}</MenuItem>)}
            </NeonField>

            <NeonField sx={{ gridArea: "sexe_id" }} select label="Sexe" name="sexe_id"
              value={form.sexe_id} onChange={handleChange} disabled={loadingRefs}
              InputProps={{ startAdornment: <InputAdornment position="start"><Wc fontSize="small" /></InputAdornment> }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) return "Sexe";
                  const s = sexes.find((x) => String(x.id) === String(selected));
                  return s ? s.label : selected;
                },
              }}>
              <MenuItem value="" dense>Non spécifié</MenuItem>
              {sexes.map((s) => <MenuItem key={s.id} value={String(s.id)} dense>{s.label}</MenuItem>)}
            </NeonField>

            {/* Téléphone - Date de naissance (âge) */}
            <NeonField sx={{ gridArea: "telephone" }} type="tel" inputMode="tel"
              label="Téléphone" name="telephone" placeholder="+33…"
              value={form.telephone} onChange={handleChange} error={!!form.telephone && !telOk}
              helperText={form.telephone && !telOk ? "Format attendu: +336..., 6–20 chiffres" : " "}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }} />
            <NeonField sx={{ gridArea: "date_naissance" }} type="date" label="Date de naissance"
              name="date_naissance" value={form.date_naissance} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!ageOk}
              helperText={!ageOk ? `Âge autorisé: ${MIN_AGE}–${MAX_AGE} ans` : " "}
              InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth fontSize="small" /></InputAdornment> }} />

            {/* Pays - Ville */}
            <NeonField sx={{ gridArea: "pays" }} label="Pays (ISO2)" name="pays"
              placeholder="FR, BE, CH…" value={form.pays}
              onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value.toUpperCase() }))}
              error={!!form.pays && !isoOk}
              helperText={form.pays && !isoOk ? "Code pays ISO2 attendu (ex: FR)" : " "}
              InputProps={{ startAdornment: <InputAdornment position="start"><Public fontSize="small" /></InputAdornment> }} />
            <NeonField sx={{ gridArea: "ville" }} label="Ville" name="ville"
              placeholder="Paris…" value={form.ville} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationCity fontSize="small" /></InputAdornment> }} />

            {/* Description */}
            <NeonField sx={{ gridArea: "description" }} label="Description" name="description"
              placeholder="Parle un peu de toi (objectif, jeux, dispo…)"
              value={form.description} onChange={handleChange}
              multiline minRows={3}
              InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon fontSize="small" /></InputAdornment> }} />

            {/* Langue */}
            <NeonField sx={{ gridArea: "langue" }} label="Langue principale" name="langue_principale"
              placeholder="fr ou fr-FR" value={form.langue_principale} onChange={handleChange}
              error={!!form.langue_principale && !langOk}
              helperText={form.langue_principale && !langOk ? "Format attendu: fr ou fr-FR" : " "}
              InputProps={{ startAdornment: <InputAdornment position="start"><Translate fontSize="small" /></InputAdornment> }} />
          </Box>

          {/* actions */}
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <NeonButton onClick={handleSave} disabled={!canSave}>
              {saving ? "Enregistrement…" : "Sauvegarder"}
            </NeonButton>
            <Button
              onClick={() => initialRef.current && setForm(initialRef.current)}
              variant="outlined"
              sx={{ height: 46, borderRadius: 12, borderColor: "rgba(124,58,237,.35)", color: "#E6E6F0",
                "&:hover": { borderColor: "#7C3AED" } }}
            >
              Réinitialiser
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* feedback */}
      <Snackbar
        open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type} variant="filled"
               onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}
