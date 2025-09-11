// src/pages/coach/IndisposManage.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Paper, Stack, Typography, Grid, Alert, CircularProgress, Chip, IconButton, MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { NeonField, NeonButton } from "../../components/ui/Neon";
import api from "../../api/axios";

const DAYS = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

const toHHmmss = (v) => v?.length === 5 ? `${v}:00` : v || ""; // "HH:mm" -> "HH:mm:ss"

export default function IndisposManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState({ from:"", to:"", actif:"true" });

  const [form, setForm] = useState({
    type: "repetitif", jour: "lundi", date_unique: "",
    heure_debut: "09:00:00", heure_fin: "11:00:00", slot_max_par_heure: 1, actif: true
  });

  const load = async () => {
    try {
      setLoading(true); setErr("");
      const params = { ...q };
      if (!params.from) delete params.from;
      if (!params.to) delete params.to;
      const { data } = await api.get("/coach/indisponibilites", { params });
      setItems(data || []);
    } catch(e){ setErr(e.response?.data?.error || "Erreur chargement"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); /* init */ },[]); // eslint-disable-line
  const apply = () => load();

  const add = async () => {
    try {
      const payload = { ...form };
      if (payload.type === "repetitif") { delete payload.date_unique; }
      if (payload.type === "unique")   { delete payload.jour; }
      // Harmoniser hh:mm en hh:mm:ss
      payload.heure_debut = toHHmmss(payload.heure_debut);
      payload.heure_fin   = toHHmmss(payload.heure_fin);
      await api.post("/coach/indisponibilites", payload);
      load();
    } catch(e){ setErr(e.response?.data?.error || "Erreur création"); }
  };
  const toggle = async (it) => {
    try { await api.patch(`/coach/indisponibilites/${it.id}`, { actif: !it.actif }); load(); }
    catch(e){ setErr(e.response?.data?.error || "Erreur maj"); }
  };
  const del = async (it) => {
    try { await api.delete(`/coach/indisponibilites/${it.id}`); load(); }
    catch(e){ setErr(e.response?.data?.error || "Erreur suppression"); }
  };

  const list = useMemo(() => {
    // petit ordre visuel
    const byType = [...items].sort((a,b)=> (a.type>b.type?1:-1) || String(a.jour||a.date_unique).localeCompare(String(b.jour||b.date_unique)) || a.heure_debut.localeCompare(b.heure_debut));
    return byType;
  }, [items]);

  return (
    <Stack spacing={2}>
      <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight:900 }}>Filtrer</Typography>
          <Grid container spacing={1.25}>
            <Grid item xs={12} sm={4}><NeonField type="date" label="Du" value={q.from} onChange={e=>setQ(s=>({ ...s, from:e.target.value }))} InputLabelProps={{ shrink:true }}/></Grid>
            <Grid item xs={12} sm={4}><NeonField type="date" label="Au" value={q.to} onChange={e=>setQ(s=>({ ...s, to:e.target.value }))} InputLabelProps={{ shrink:true }}/></Grid>
            <Grid item xs={12} sm={4}>
              <NeonField select label="Actif" value={q.actif} onChange={e=>setQ(s=>({ ...s, actif:e.target.value }))}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="true">Actifs</MenuItem>
                <MenuItem value="false">Inactifs</MenuItem>
              </NeonField>
            </Grid>
            <Grid item xs={12}><NeonButton onClick={apply}>Appliquer</NeonButton></Grid>
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight:900 }}>Ajouter une indisponibilité</Typography>
          {err && <Alert severity="error">{err}</Alert>}
          <Grid container spacing={1.25}>
            <Grid item xs={12} sm={3}>
              <NeonField select label="Type" value={form.type} onChange={e=>setForm(s=>({ ...s, type:e.target.value }))}>
                <MenuItem value="repetitif">Répétitif</MenuItem>
                <MenuItem value="unique">Unique</MenuItem>
              </NeonField>
            </Grid>
            {form.type === "repetitif" ? (
              <Grid item xs={12} sm={3}>
                <NeonField select label="Jour" value={form.jour} onChange={e=>setForm(s=>({ ...s, jour:e.target.value }))}>
                  {DAYS.map(d=><MenuItem key={d} value={d}>{d}</MenuItem>)}
                </NeonField>
              </Grid>
            ) : (
              <Grid item xs={12} sm={3}>
                <NeonField type="date" label="Date" value={form.date_unique} onChange={e=>setForm(s=>({ ...s, date_unique:e.target.value }))} InputLabelProps={{ shrink:true }}/>
              </Grid>
            )}
            <Grid item xs={6} sm={2}><NeonField type="time" label="Début" value={form.heure_debut} onChange={e=>setForm(s=>({ ...s, heure_debut:e.target.value }))} inputProps={{ step:1 }} InputLabelProps={{ shrink:true }}/></Grid>
            <Grid item xs={6} sm={2}><NeonField type="time" label="Fin" value={form.heure_fin} onChange={e=>setForm(s=>({ ...s, heure_fin:e.target.value }))} inputProps={{ step:1 }} InputLabelProps={{ shrink:true }}/></Grid>
            <Grid item xs={6} sm={2}><NeonField type="number" label="Slots/heure" value={form.slot_max_par_heure} onChange={e=>setForm(s=>({ ...s, slot_max_par_heure:Number(e.target.value||1) }))}/></Grid>
            <Grid item xs={6} sm={2}>
              <NeonField select label="Actif" value={form.actif ? "1":"0"} onChange={e=>setForm(s=>({ ...s, actif: e.target.value==="1" }))}>
                <MenuItem value="1">Oui</MenuItem><MenuItem value="0">Non</MenuItem>
              </NeonField>
            </Grid>
            <Grid item xs={12}><NeonButton onClick={add}>Ajouter</NeonButton></Grid>
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight:900 }}>Liste</Typography>
          {loading ? <CircularProgress/> : (
            <Stack spacing={.75}>
              {!list.length && <Typography sx={{ opacity:.7 }}>Aucune indisponibilité.</Typography>}
              {list.map(it => (
                <Stack key={it.id} direction="row" spacing={1} alignItems="center" sx={{ border:"1px solid rgba(124,58,237,.25)", p:1, borderRadius:2 }}>
                  <Chip size="small" color={it.actif ? "success" : "default"} label={it.actif ? "actif" : "inactif"}/>
                  <Chip size="small" variant="outlined" label={it.type}/>
                  <Typography>
                    {it.type === "repetitif"
                      ? `${it.jour} ${it.heure_debut} → ${it.heure_fin}`
                      : `${it.date_unique} ${it.heure_debut} → ${it.heure_fin}`}
                    {it.slot_max_par_heure > 1 ? ` • ${it.slot_max_par_heure} slots/h` : ""}
                  </Typography>
                  <span style={{ flex:1 }}/>
                  <IconButton onClick={()=>toggle(it)}>{it.actif ? <ToggleOnIcon/> : <ToggleOffIcon/>}</IconButton>
                  <IconButton onClick={()=>del(it)}><DeleteIcon/></IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
