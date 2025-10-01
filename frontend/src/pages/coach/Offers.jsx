// src/pages/coach/Offers.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, TextField, MenuItem, InputAdornment,
  Button, Divider, Snackbar, Alert, Chip, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HighlightOff from "@mui/icons-material/HighlightOff";

const TYPES = ["INDIVIDUEL","REPLAY","GROUPE","LIVE"];

export default function CoachOffers() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0, totalPages: 1 });
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [actif, setActif] = useState("");
  const [sort, setSort] = useState("created_at:desc");

  const [form, setForm] = useState({ type: "INDIVIDUEL", titre: "", description: "", duree_min: 60, prix_centimes: 0, devise: "EUR", actif: true });
  const [editingId, setEditingId] = useState(null);

  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  async function load(page = 1) {
    try {
      const params = { page, perPage: pagination.perPage, sort };
      if (q) params.q = q;
      if (type) params.type = type;
      if (actif !== "") params.actif = actif === "true";
      const { data } = await api.get("/coach/offers", { params });
      setItems(data.items || []);
      setPagination(data.pagination || { page, perPage: 20, total: 0, totalPages: 1 });
    } catch {
      setItems([]);
      setPagination({ page: 1, perPage: 20, total: 0, totalPages: 1 });
    }
  }
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [sort]);

  const resetForm = () => {
    setForm({ type: "INDIVIDUEL", titre: "", description: "", duree_min: 60, prix_centimes: 0, devise: "EUR", actif: true });
    setEditingId(null);
  };

  const submitForm = async () => {
    try {
      const payload = { ...form };
      payload.prix_centimes = Number(payload.prix_centimes) || 0;
      payload.duree_min = payload.type === "REPLAY" ? 0 : Number(payload.duree_min) || 0;

      if (editingId) {
        const { data } = await api.patch(`/coach/offers/${editingId}`, payload);
        setSnack({ open: true, type: "success", msg: "Offre mise à jour" });
      } else {
        await api.post("/coach/offers", payload);
        setSnack({ open: true, type: "success", msg: "Offre créée" });
      }
      resetForm();
      load(1);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Erreur d’enregistrement" });
    }
  };

  const toggleActive = async (off) => {
    try {
      if (off.actif) await api.post(`/coach/offers/${off.id}/desactiver`);
      else await api.post(`/coach/offers/${off.id}/activer`);
      load(pagination.page);
    } catch {}
  };

  const remove = async (off) => {
    try {
      await api.delete(`/coach/offers/${off.id}`);
      setSnack({ open: true, type: "success", msg: "Offre supprimée" });
      load(1);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Suppression impossible" });
    }
  };

  const startEdit = (o) => {
    setEditingId(o.id);
    setForm({
      type: o.type,
      titre: o.titre || "",
      description: o.description || "",
      duree_min: o.type === "REPLAY" ? 0 : Number(o.duree_min || 0),
      prix_centimes: Number(o.prix_centimes || 0),
      devise: o.devise || "EUR",
      actif: !!o.actif,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box>
      {/* Filtres */}
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)", mb: 2 }}>
        <Stack direction={{ xs:"column", md:"row" }} spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Mes offres</Typography>
          <TextField size="small" placeholder="Rechercher un titre…" value={q} onChange={(e)=>setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <TextField select size="small" label="Type" value={type} onChange={(e)=>setType(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">Tous</MenuItem>
            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Actif" value={actif} onChange={(e)=>setActif(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Actif</MenuItem>
            <MenuItem value="false">Inactif</MenuItem>
          </TextField>
          <TextField select size="small" label="Tri" value={sort} onChange={(e)=>setSort(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="created_at:desc">Création (récent)</MenuItem>
            <MenuItem value="created_at:asc">Création (ancien)</MenuItem>
            <MenuItem value="prix_centimes:asc">Prix ↑</MenuItem>
            <MenuItem value="prix_centimes:desc">Prix ↓</MenuItem>
            <MenuItem value="titre:asc">Titre A→Z</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={()=>load(1)}>Appliquer</Button>
        </Stack>
      </Paper>

      {/* Form create/update */}
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)", mb: 2 }}>
        <Stack direction={{ xs:"column", md:"row" }} spacing={1}>
          <TextField select label="Type" value={form.type} onChange={(e)=>setForm(f=>({...f,type:e.target.value, duree_min: e.target.value==="REPLAY"?0:f.duree_min}))} sx={{ minWidth: 160 }}>
            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Titre" value={form.titre} onChange={(e)=>setForm(f=>({...f,titre:e.target.value}))} sx={{ minWidth: 220 }} />
          {form.type !== "REPLAY" && (
            <TextField type="number" label="Durée (min)" value={form.duree_min} onChange={(e)=>setForm(f=>({...f,duree_min:e.target.value}))} sx={{ width: 140 }} />
          )}
          <TextField type="number" label="Prix (centimes)" value={form.prix_centimes} onChange={(e)=>setForm(f=>({...f,prix_centimes:e.target.value}))} sx={{ width: 160 }} />
          <TextField label="Devise" value={form.devise} onChange={(e)=>setForm(f=>({...f,devise:e.target.value}))} sx={{ width: 120 }} />
          <TextField label="Description" value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} fullWidth />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={submitForm}>
            {editingId ? "Mettre à jour" : "Créer l’offre"}
          </Button>
          {editingId && <Button variant="outlined" onClick={resetForm}>Annuler</Button>}
        </Stack>
      </Paper>

      {/* Liste */}
      <Stack spacing={1.25}>
        {items.map((o) => (
          <Paper key={o.id} variant="outlined" sx={{ p: 1.25, borderColor: "rgba(124,58,237,.25)" }}>
            <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems={{ xs:"flex-start", sm:"center" }} justifyContent="space-between">
              <Stack spacing={0.25}>
                <Typography sx={{ fontWeight: 800 }}>
                  {o.titre} — {o.type} — {(o.prix_centimes/100).toFixed(2)} € {o.duree_min ? `• ${o.duree_min} min` : ""}
                </Typography>
                <Typography variant="body2" sx={{ opacity: .8 }}>{o.description || "—"}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={o.actif ? "Actif" : "Inactif"} color={o.actif ? "success" : "default"} size="small" />
                <Button size="small" variant="outlined" onClick={()=>startEdit(o)}>Éditer</Button>
                <IconButton onClick={()=>toggleActive(o)} color={o.actif ? "warning" : "success"} title={o.actif ? "Désactiver" : "Activer"}>
                  {o.actif ? <HighlightOff /> : <CheckCircleOutline />}
                </IconButton>
                <IconButton onClick={()=>remove(o)} color="error" title="Supprimer">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
        {items.length === 0 && (
          <Typography sx={{ opacity: .75, textAlign: "center", py: 2 }}>
            Aucune offre pour le moment.
          </Typography>
        )}
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
