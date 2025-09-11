// src/pages/coach/PalmaresManage.jsx
import { useEffect, useState } from "react";
import {
  Paper, Stack, Typography, Grid, Alert, CircularProgress, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { NeonField, NeonButton } from "../../components/ui/Neon";
import api from "../../api/axios";

export default function PalmaresManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [f, setF] = useState({ titre:"", description:"", annee:"" });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try { setLoading(true); setErr("");
      const { data } = await api.get("/coach/palmares");
      setItems(data || []);
    } catch(e){ setErr(e.response?.data?.error || "Erreur chargement"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const resetForm = () => setF({ titre:"", description:"", annee:"" });

  const add = async () => {
    try {
      const payload = { ...f, annee: f.annee ? Number(f.annee) : undefined };
      await api.post("/coach/palmares", payload);
      resetForm(); load();
    } catch(e){ setErr(e.response?.data?.error || "Erreur ajout"); }
  };

  const openEdit = (it) => { setEditId(it.id); setF({ titre: it.titre, description: it.description || "", annee: it.annee || "" }); };
  const saveEdit = async () => {
    try {
      const payload = {};
      if (f.titre) payload.titre = f.titre;
      payload.description = f.description ?? "";
      if (f.annee !== "") payload.annee = Number(f.annee);
      await api.patch(`/coach/palmares/${editId}`, payload);
      setEditId(null); resetForm(); load();
    } catch(e){ setErr(e.response?.data?.error || "Erreur maj"); }
  };
  const del = async (id) => {
    try { await api.delete(`/coach/palmares/${id}`); load(); }
    catch(e){ setErr(e.response?.data?.error || "Erreur suppression"); }
  };

  return (
    <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
      <Stack spacing={1.25}>
        <Typography variant="h6" sx={{ fontWeight:900 }}>Mon palmarès</Typography>
        {err && <Alert severity="error">{err}</Alert>}

        <Grid container spacing={1.25}>
          <Grid item xs={12} md={4}><NeonField label="Titre" value={f.titre} onChange={e=>setF(s=>({ ...s, titre:e.target.value }))}/></Grid>
          <Grid item xs={6} md={2}><NeonField type="number" label="Année" value={f.annee} onChange={e=>setF(s=>({ ...s, annee:e.target.value }))}/></Grid>
          <Grid item xs={12} md={6}><NeonField label="Description" value={f.description} onChange={e=>setF(s=>({ ...s, description:e.target.value }))}/></Grid>
          <Grid item xs={12}><NeonButton onClick={add}>Ajouter</NeonButton></Grid>
        </Grid>

        {loading ? <CircularProgress/> : (
          <Stack spacing={1}>
            {!items.length && <Typography sx={{ opacity:.7 }}>Aucune entrée.</Typography>}
            {items.map(it => (
              <Stack key={it.id} direction="row" spacing={1} alignItems="center" sx={{ border:"1px solid rgba(124,58,237,.25)", p:1, borderRadius:2 }}>
                <Chip size="small" label={it.annee ?? "—"} />
                <Typography sx={{ fontWeight:700 }}>{it.titre}</Typography>
                {it.description && <Typography variant="body2" sx={{ opacity:.8 }}>— {it.description}</Typography>}
                <span style={{ flex:1 }} />
                <IconButton onClick={()=>openEdit(it)}><EditIcon/></IconButton>
                <IconButton onClick={()=>del(it.id)}><DeleteIcon/></IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog open={!!editId} onClose={()=>setEditId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt:1 }}>
            <NeonField label="Titre" value={f.titre} onChange={e=>setF(s=>({ ...s, titre:e.target.value }))}/>
            <NeonField type="number" label="Année" value={f.annee} onChange={e=>setF(s=>({ ...s, annee:e.target.value }))}/>
            <NeonField label="Description" value={f.description} onChange={e=>setF(s=>({ ...s, description:e.target.value }))}/>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditId(null)}>Annuler</Button>
          <NeonButton onClick={saveEdit}>Enregistrer</NeonButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
