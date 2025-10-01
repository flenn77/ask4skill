// src/pages/coach/Palmares.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Paper, Stack, Typography, TextField, MenuItem, Button, IconButton,
  Snackbar, Alert, Divider
} from "@mui/material";
import { NeonField, NeonButton } from "../../components/ui/Neon";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

export default function CoachPalmares() {
  const [items, setItems] = useState([]);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  const [draft, setDraft] = useState({ titre: "", description: "", annee: new Date().getFullYear() });

  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/coach/palmares");
      setItems(data || []);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Erreur de chargement" });
    }
  }
  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await api.post("/coach/palmares", {
        titre: draft.titre.trim(),
        description: draft.description?.trim() || null,
        annee: Number(draft.annee),
      });
      setDraft({ titre: "", description: "", annee: new Date().getFullYear() });
      setSnack({ open: true, type: "success", msg: "Ajouté" });
      load();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Création impossible" });
    }
  };

  const startEdit = (row) => { setEditingId(row.id); setEditRow({ ...row }); };
  const cancelEdit = () => { setEditingId(null); setEditRow(null); };

  const saveEdit = async () => {
    try {
      await api.patch(`/coach/palmares/${editingId}`, {
        titre: editRow.titre.trim(),
        description: editRow.description?.trim() || null,
        annee: Number(editRow.annee),
      });
      setSnack({ open: true, type: "success", msg: "Mis à jour" });
      cancelEdit();
      load();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Mise à jour impossible" });
    }
  };

  const remove = async (row) => {
    if (!confirm(`Supprimer “${row.titre} (${row.annee})” ?`)) return;
    try { await api.delete(`/coach/palmares/${row.id}`); setSnack({ open: true, type: "success", msg: "Supprimé" }); load(); }
    catch (e) { setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Suppression impossible" }); }
  };

  return (
    <>
      <Paper sx={{ p:2, borderRadius:2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Ajouter un palmarès</Typography>
        <Stack direction={{ xs:"column", sm:"row" }} spacing={1}>
          <NeonField label="Titre" value={draft.titre} onChange={(e)=>setDraft(d=>({ ...d, titre: e.target.value }))} />
          <NeonField label="Description" value={draft.description} onChange={(e)=>setDraft(d=>({ ...d, description: e.target.value }))} />
          <TextField label="Année" type="number" value={draft.annee} onChange={(e)=>setDraft(d=>({ ...d, annee: e.target.value }))} />
          <NeonButton onClick={create} disabled={!draft.titre.trim()}>Ajouter</NeonButton>
        </Stack>
      </Paper>

      <Paper sx={{ p:2, mt:2, borderRadius:2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Mes palmarès</Typography>
        <Stack spacing={1}>
          {items.map((r) => (
            <Paper key={r.id} variant="outlined" sx={{ p:1.25, borderColor: "rgba(124,58,237,.25)" }}>
              {editingId === r.id ? (
                <Stack spacing={1}>
                  <Stack direction={{ xs:"column", sm:"row" }} spacing={1}>
                    <NeonField label="Titre" value={editRow.titre} onChange={(e)=>setEditRow(v=>({ ...v, titre: e.target.value }))} />
                    <NeonField label="Description" value={editRow.description||""} onChange={(e)=>setEditRow(v=>({ ...v, description: e.target.value }))} />
                    <TextField label="Année" type="number" value={editRow.annee} onChange={(e)=>setEditRow(v=>({ ...v, annee: e.target.value }))} />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<CloseIcon />} onClick={cancelEdit}>Annuler</Button>
                    <NeonButton startIcon={<SaveIcon />} onClick={saveEdit}>Sauvegarder</NeonButton>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems={{ xs:"flex-start", sm:"center" }} justifyContent="space-between">
                  <Stack>
                    <Typography sx={{ fontWeight: 800 }}>{r.titre} <Typography component="span" sx={{ opacity:.7 }}>({r.annee})</Typography></Typography>
                    {r.description && <Typography variant="body2" sx={{ opacity:.8 }}>{r.description}</Typography>}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={()=>startEdit(r)}>Modifier</Button>
                    <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={()=>remove(r)}>Supprimer</Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          ))}
          {items.length === 0 && <Typography sx={{ opacity:.7, textAlign:"center", py:2 }}>Aucun palmarès.</Typography>}
        </Stack>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
