// src/pages/explore/CoachDetails.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api/axios";
import {
  Box, Paper, Stack, Typography, Chip, Divider, TextField, MenuItem,
  Button, Snackbar, Alert
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EuroIcon from "@mui/icons-material/Euro";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import VerifiedIcon from "@mui/icons-material/Verified";

const TYPES = ["INDIVIDUEL","REPLAY"]; // aligne-toi avec le backend

export default function CoachDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  // form demande
  const [type, setType] = useState("INDIVIDUEL");
  const [date, setDate] = useState(""); // datetime-local
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get(`/coachs/${id}`); // public
        if (!active) return;
        setCoach(data);
      } catch {
        setCoach(null);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const canSubmit = useMemo(() => {
    if (!coach) return false;
    if (type === "INDIVIDUEL") return !!date;
    return true;
  }, [coach, type, date]);

  const toISO = (dtLocal) => {
    if (!dtLocal) return null;
    const d = new Date(dtLocal);
    return isNaN(d) ? null : d.toISOString();
  };

  const createDemande = async () => {
    try {
      const payload = {
        coach_id: coach.id,
        type,
        date_debut: type === "INDIVIDUEL" ? toISO(date) : null,
        message_joueur: message || undefined,
      };
      await api.post("/demandes", payload);
      setSnack({ open: true, type: "success", msg: "Demande envoyée !" });
      navigate("/demandes");
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.response?.data?.error || "Impossible d’envoyer la demande" });
    }
  };

  if (!coach) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Paper sx={{ p: 2 }}><Typography>Chargement…</Typography></Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>
            {coach.titre}
          </Typography>
          {coach.est_certifie && <VerifiedIcon color="info" titleAccess="Certifié" />}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: .75, flexWrap: "wrap" }}>
          {(coach.games||[]).map(g => <Chip key={g} size="small" icon={<SportsEsportsIcon />} label={g} />)}
          {(coach.specialites||[]).map(s => <Chip key={s} size="small" variant="outlined" label={s} />)}
        </Stack>

        <Divider sx={{ my: 1.5, opacity: .3 }} />

        <Stack direction={{ xs:"column", md:"row" }} spacing={2} alignItems="stretch">
          {/* Col 1: infos/prix */}
          <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2" sx={{ opacity: .85 }}>
                  Slot: {coach.duree_slot_min} min • Fuseau: {coach.fuseau_horaire}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip icon={<EuroIcon />} label={`${coach.prix_par_heure} €/h`} />
                {coach.prix_replay && <Chip icon={<EuroIcon />} label={`Replay ${coach.prix_replay} €`} />}
                {coach.prix_session_groupe && <Chip icon={<EuroIcon />} label={`Groupe ${coach.prix_session_groupe} €`} />}
              </Stack>

              {Array.isArray(coach.palmares) && coach.palmares.length > 0 && (
                <>
                  <Divider sx={{ my: 1, opacity: .2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Palmarès</Typography>
                  <Stack spacing={0.5}>
                    {coach.palmares.map(p => (
                      <Typography key={p.id} variant="body2" sx={{ opacity: .9 }}>
                        • {p.titre} ({p.annee}) — {p.description}
                      </Typography>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          {/* Col 2: créer une demande */}
          <Paper variant="outlined" sx={{ p: 1.5, flex: 1, minWidth: 320 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Créer une demande</Typography>
            <Stack spacing={1}>
              <TextField select label="Type" value={type} onChange={(e)=>setType(e.target.value)}>
                {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>

              {type === "INDIVIDUEL" && (
                <TextField
                  type="datetime-local"
                  label="Date & heure"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e)=>setDate(e.target.value)}
                />
              )}

              <TextField
                label="Message (optionnel)"
                multiline minRows={2}
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                placeholder="Ex: session aim / rank up…"
              />

              <Button variant="contained" disabled={!canSubmit} onClick={createDemande}>
                Envoyer la demande
              </Button>

              <Button variant="outlined" component={RouterLink} to="/explore">
                Retour à l’exploration
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.type} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
