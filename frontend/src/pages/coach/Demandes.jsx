// src/pages/coach/Demandes.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, Button, TextField, MenuItem,
  Snackbar, Alert, Chip
} from "@mui/material";

const STATUTS = ["EN_ATTENTE","ACCEPTEE","REFUSEE"];

export default function CoachDemandes() {
  const [items, setItems] = useState([]);
  const [statut, setStatut] = useState("EN_ATTENTE");
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/coach/demandes", { params: { statut } });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]); setSnack({ open: true, type: "error", msg: "Impossible de charger les demandes." });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statut]);

  const accepter = async (id) => {
    if (!confirm("Accepter cette demande ?")) return;
    try {
      await api.post(`/coach/demandes/${id}/accepter`, { conversation_id: "conv_demo_from_ui" });
      setSnack({ open: true, type: "success", msg: "Demande acceptée" });
      load();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Action impossible" });
    }
  };

  const refuser = async (id) => {
    const raison_refus = prompt("Raison du refus ? (optionnel)") || "indisponible";
    try {
      await api.post(`/coach/demandes/${id}/refuser`, { raison_refus });
      setSnack({ open: true, type: "success", msg: "Demande refusée" });
      load();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Action impossible" });
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)", mb: 2 }}>
        <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Demandes reçues</Typography>
          <TextField select size="small" label="Statut" value={statut} onChange={(e)=>setStatut(e.target.value)} sx={{ minWidth: 180 }}>
            {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button variant="outlined" onClick={load} disabled={loading}>{loading ? "…" : "Rafraîchir"}</Button>
        </Stack>
      </Paper>

      <Stack spacing={1.25}>
        {items.map((d) => (
          <Paper key={d.id} variant="outlined" sx={{ p: 1.25, borderColor: "rgba(124,58,237,.25)" }}>
            <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems={{ xs:"flex-start", sm:"center" }} justifyContent="space-between">
              <Stack spacing={0.25}>
                <Typography sx={{ fontWeight: 800 }}>
                  {d.type} — {(d.prix_centimes/100).toFixed(2)} € {d.duree_min ? `• ${d.duree_min} min` : ""}
                </Typography>
                <Typography variant="body2" sx={{ opacity: .8 }}>
                  {d.date_debut ? new Date(d.date_debut).toLocaleString() : "Sans date"}
                </Typography>
                {d.message_joueur && <Typography variant="body2" sx={{ opacity: .9 }}>"{d.message_joueur}"</Typography>}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={d.statut} color={d.statut==="EN_ATTENTE" ? "warning" : d.statut==="ACCEPTEE" ? "success" : "secondary"} size="small" />
                {d.statut === "EN_ATTENTE" && (
                  <>
                    <Button size="small" variant="contained" onClick={()=>accepter(d.id)}>Accepter</Button>
                    <Button size="small" variant="outlined" color="warning" onClick={()=>refuser(d.id)}>Refuser</Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
        {items.length === 0 && (
          <Typography sx={{ opacity: .75, textAlign: "center", py: 2 }}>
            {loading ? "Chargement…" : "Aucune demande."}
          </Typography>
        )}
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
