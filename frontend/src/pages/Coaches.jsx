// src/pages/Coaches.jsx
import { useEffect, useState } from "react";
import { Container, Stack, Grid, Typography, Paper, MenuItem, Alert, CircularProgress } from "@mui/material";
import { NeonField, NeonButton } from "../components/ui/Neon";
import api from "../api/axios";
import CoachCard from "../components/CoachCard";

const sorts = [
  { v:"date_desc", label:"Plus récents" },
  { v:"date_asc",  label:"Plus anciens" },
  { v:"price_asc", label:"Prix croissant" },
  { v:"price_desc",label:"Prix décroissant" },
];

export default function Coaches() {
  const [q, setQ] = useState({ game:"", specialty:"", priceField:"heure", priceMin:"", priceMax:"", sort:"date_desc" });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [items, setItems]     = useState([]);

  const load = async () => {
    try {
      setLoading(true); setError("");
      const params = { ...q };
      if (!params.priceMin) delete params.priceMin;
      if (!params.priceMax) delete params.priceMax;
      const { data } = await api.get("/coachs", { params });
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setError(e.response?.data?.error || "Erreur de chargement");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* auto */ }, []); // eslint-disable-line

  return (
    <Container sx={{ py: 3 }}>
      <Stack spacing={1.5} sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Trouve ton coach</Typography>
        <Typography variant="body2" sx={{ opacity:.75 }}>
          Filtre par jeu, spécialité et budget. Les prix utilisent le champ choisi (heure/replay/groupe).
        </Typography>
      </Stack>

      <Paper sx={{ p:1.25, mb:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={3}>
            <NeonField label="Jeu" value={q.game} onChange={e=>setQ(s=>({ ...s, game:e.target.value }))}/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NeonField label="Spécialité" value={q.specialty} onChange={e=>setQ(s=>({ ...s, specialty:e.target.value }))} placeholder="ex: individuel"/>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <NeonField select label="Champ de prix" value={q.priceField} onChange={e=>setQ(s=>({ ...s, priceField:e.target.value }))}>
              <MenuItem value="heure">Heure</MenuItem>
              <MenuItem value="replay">Replay</MenuItem>
              <MenuItem value="groupe">Groupe</MenuItem>
            </NeonField>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <NeonField type="number" label="Prix min" value={q.priceMin} onChange={e=>setQ(s=>({ ...s, priceMin:e.target.value }))}/>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <NeonField type="number" label="Prix max" value={q.priceMax} onChange={e=>setQ(s=>({ ...s, priceMax:e.target.value }))}/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NeonField select label="Trier par" value={q.sort} onChange={e=>setQ(s=>({ ...s, sort:e.target.value }))}>
              {sorts.map(s => <MenuItem key={s.v} value={s.v}>{s.label}</MenuItem>)}
            </NeonField>
          </Grid>
          <Grid item xs={12} sm="auto">
            <NeonButton onClick={load}>Appliquer</NeonButton>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress/></Stack>
      ) : (
        <Grid container spacing={1.5}>
          {items.map(c => (
            <Grid key={c.id} item xs={12} sm={6} md={4}><CoachCard coach={c}/></Grid>
          ))}
          {!items.length && <Grid item xs={12}><Typography sx={{ opacity:.7 }}>Aucun coach trouvé.</Typography></Grid>}
        </Grid>
      )}
    </Container>
  );
}
