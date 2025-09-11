// src/pages/coach/SpecialitesManage.jsx
import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Chip, Alert, CircularProgress } from "@mui/material";
import { NeonField, NeonButton } from "../../components/ui/Neon";
import api from "../../api/axios";

export default function SpecialitesManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [val, setVal] = useState("");

  const load = async () => {
    try { setLoading(true); setErr("");
      const { data } = await api.get("/coach/specialites");
      setItems(data || []);
    } catch(e){ setErr(e.response?.data?.error || "Erreur chargement"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const add = async () => {
    if (!val.trim()) return;
    try { await api.post("/coach/specialites", { specialty: val.trim().toLowerCase() }); setVal(""); load(); }
    catch(e){ setErr(e.response?.data?.error || "Erreur ajout"); }
  };
  const del = async (specialty) => {
    try { await api.delete(`/coach/specialites/${encodeURIComponent(specialty)}`); load(); }
    catch(e){ setErr(e.response?.data?.error || "Erreur suppression"); }
  };

  return (
    <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
      <Stack spacing={1.25}>
        <Typography variant="h6" sx={{ fontWeight:900 }}>Mes spécialités</Typography>
        {err && <Alert severity="error">{err}</Alert>}

        <Stack direction="row" spacing={1}>
          <NeonField label="Nouvelle spécialité (ex: individuel)" value={val} onChange={e=>setVal(e.target.value)} />
          <NeonButton onClick={add}>Ajouter</NeonButton>
        </Stack>

        {loading ? <CircularProgress/> : (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {items.map(i => (
              <Chip key={i.id} label={i.specialty} onDelete={()=>del(i.specialty)} variant="outlined" />
            ))}
            {!items.length && <Typography sx={{ opacity:.7 }}>Aucune spécialité.</Typography>}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
