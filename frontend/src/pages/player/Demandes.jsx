// src/pages/player/Demandes.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, Chip, Button, Divider, Snackbar, Alert, TextField, MenuItem
} from "@mui/material";

const STATUTS = ["TOUTES","EN_ATTENTE","ACCEPTEE","REFUSEE","ARCHIVEE"];

export default function PlayerDemandes() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("TOUTES");
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/demandes/moi");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setSnack({ open: true, type: "error", msg: "Impossible de charger les demandes." });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const list = items.filter(d => filter === "TOUTES" || d.statut === filter);

  const archive = async (id) => {
    if (!id) return;
    if (!confirm("Archiver cette demande ?")) return;
    try {
      await api.post(`/demandes/${id}/archiver`);
      setSnack({ open: true, type: "success", msg: "Demande archivée" });
      load();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Action impossible" });
    }
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Mes demandes</Typography>
          <TextField select size="small" label="Filtrer" value={filter} onChange={(e)=>setFilter(e.target.value)}>
            {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button variant="outlined" onClick={load} disabled={loading}>{loading ? "…" : "Rafraîchir"}</Button>
        </Stack>

        <Divider sx={{ my: 1.5, opacity: .3 }} />

        <Stack spacing={1.25}>
          {list.map((d) => (
            <Paper key={d.id} variant="outlined" sx={{ p: 1.25, borderColor: "rgba(124,58,237,.25)" }}>
              <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems={{ xs:"flex-start", sm:"center" }} justifyContent="space-between">
                <Stack spacing={0.25}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {d.type} — {(d.prix_centimes/100).toFixed(2)} € {d.duree_min ? `• ${d.duree_min} min` : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: .8 }}>
                    {d.date_debut ? new Date(d.date_debut).toLocaleString() : "Sans date"}
                  </Typography>
                  {d.message_joueur && (
                    <Typography variant="body2" sx={{ opacity: .8 }}>"{d.message_joueur}"</Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={d.statut}
                    color={
                      d.statut==="EN_ATTENTE" ? "warning"
                      : d.statut==="ACCEPTEE" ? "success"
                      : d.statut==="ARCHIVEE" ? "default" : "secondary"
                    }
                    size="small"
                  />
                  {d.statut !== "ARCHIVEE" && (
                    <Button size="small" variant="outlined" onClick={()=>archive(d.id)}>
                      Archiver
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
          {list.length === 0 && (
            <Typography sx={{ opacity: .75, textAlign: "center", py: 2 }}>
              {loading ? "Chargement…" : "Aucune demande pour l’instant."}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
