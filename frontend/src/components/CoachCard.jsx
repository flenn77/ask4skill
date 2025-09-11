// src/components/CoachCard.jsx
import { Link as RouterLink } from "react-router-dom";
import { Paper, Stack, Box, Typography, Chip, Button } from "@mui/material";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function CoachCard({ coach }) {
  const title = coach?.titre || "Coach";
  const price = coach?.prix_par_heure != null ? `${coach.prix_par_heure} ${coach.devise||"EUR"}/h` : null;
  return (
    <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
          {coach?.est_certifie && <Chip size="small" color="success" icon={<VerifiedIcon/>} label="Certifié" />}
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {coach?.games?.slice(0,3).map(g => <Chip key={g} size="small" label={g} />)}
          {coach?.specialites?.slice(0,3).map(s => <Chip key={s} size="small" variant="outlined" icon={<MilitaryTechIcon/>} label={s} />)}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {price && <Chip color="secondary" size="small" label={price} sx={{ fontWeight:800 }} />}
          <Box sx={{ flexGrow:1 }}/>
          <Button component={RouterLink} to={`/coachs/${coach.id}`} variant="contained" sx={{ borderRadius:2, fontWeight:800 }}>
            Voir
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
