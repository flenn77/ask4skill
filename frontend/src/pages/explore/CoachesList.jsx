// src/pages/explore/CoachesList.jsx
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, TextField, InputAdornment,
  Chip, Grid, Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function CoachesList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/coachs"); // public
        if (!active) return;
        setItems(data || []);
      } catch { /* noop */ }
    })();
    return () => { active = false; };
  }, []);

  const filtered = items.filter(c =>
    !q.trim() ||
    c.titre?.toLowerCase().includes(q.toLowerCase()) ||
    (c.games||[]).some(g => g.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Trouver un coach</Typography>
          <TextField
            placeholder="Rechercher par titre ou jeu…"
            size="small"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {filtered.map((c) => (
          <Grid item key={c.id} xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%", display: "grid", gap: 8, alignContent: "start" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800, flexGrow: 1 }}>
                  {c.titre}
                </Typography>
                {c.est_certifie && <VerifiedIcon titleAccess="Certifié" color="info" />}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                {(c.games||[]).map((g)=><Chip key={g} size="small" icon={<SportsEsportsIcon />} label={g} />)}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                {(c.specialites||[]).map((s)=><Chip key={s} size="small" variant="outlined" label={s} />)}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip icon={<LocalOfferIcon />} label={`${c.prix_par_heure} €/h`} />
                {c.prix_replay && <Chip icon={<LocalOfferIcon />} label={`Replay ${c.prix_replay} €`} />}
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: .8 }}>
                  {c.disponible_actuellement ? "Disponible maintenant" : "Pas dispo maintenant"}
                </Typography>
                <Button size="small" variant="contained" component={RouterLink} to={`/coachs/${c.id}`}>
                  Voir le profil
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ opacity: .75, textAlign: "center", py: 4 }}>
              Aucun coach ne correspond à ta recherche.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
