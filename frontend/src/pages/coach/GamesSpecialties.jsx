// src/pages/coach/GamesSpecialties.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, TextField, Button, Chip, IconButton, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CoachGamesSpecialties() {
  const [games, setGames] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [game, setGame] = useState("");
  const [spec, setSpec] = useState("");
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  async function load() {
    try {
      const [g, s] = await Promise.all([api.get("/coach/games"), api.get("/coach/specialties")]);
      setGames(g.data || []);
      setSpecialties(s.data || []);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  const addGame = async () => {
    if (!game.trim()) return;
    try { await api.post("/coach/games", { game: game.trim() }); setGame(""); load(); }
    catch (e) { setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Ajout impossible" }); }
  };
  const rmGame = async (id) => { try { await api.delete(`/coach/games/${id}`); load(); } catch {} };

  const addSpec = async () => {
    if (!spec.trim()) return;
    try { await api.post("/coach/specialties", { specialty: spec.trim() }); setSpec(""); load(); }
    catch (e) { setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Ajout impossible" }); }
  };
  const rmSpec = async (id) => { try { await api.delete(`/coach/specialties/${id}`); load(); } catch {} };

  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>Jeux</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField label="Ajouter un jeu" value={game} onChange={(e)=>setGame(e.target.value)} />
          <Button variant="contained" onClick={addGame}>Ajouter</Button>
          <Button variant="outlined" onClick={load}>Rafraîchir</Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {games.map(g => (
            <Chip key={g.id} label={g.game} onDelete={()=>rmGame(g.id)} deleteIcon={<DeleteIcon />} sx={{ m: .5 }} />
          ))}
          {games.length === 0 && <Typography sx={{ opacity: .7, mt: 1 }}>Aucun jeu.</Typography>}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>Spécialités</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField label="Ajouter une spécialité" value={spec} onChange={(e)=>setSpec(e.target.value)} />
          <Button variant="contained" onClick={addSpec}>Ajouter</Button>
          <Button variant="outlined" onClick={load}>Rafraîchir</Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {specialties.map(s => (
            <Chip key={s.id} label={s.specialty} onDelete={()=>rmSpec(s.id)} deleteIcon={<DeleteIcon />} sx={{ m: .5 }} />
          ))}
          {specialties.length === 0 && <Typography sx={{ opacity: .7, mt: 1 }}>Aucune spécialité.</Typography>}
        </Stack>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
