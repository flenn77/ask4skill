// src/pages/CoachDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Stack, Typography, Chip, Grid, Paper, Alert, CircularProgress, Box, Divider,
} from "@mui/material";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import VerifiedIcon from "@mui/icons-material/Verified";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import api from "../api/axios";

export default function CoachDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [indispos, setIndispos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr("");
        const [{ data: coach }, { data: indis }] = await Promise.all([
          api.get(`/coachs/${id}`),
          api.get(`/coachs/${id}/indisponibilites`, { params: { actif: true } }),
        ]);
        setData(coach); setIndispos(indis);
      } catch (e) {
        setErr(e.response?.data?.error || "Coach introuvable");
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress/></Stack>;
  if (err) return <Container sx={{ py: 3 }}><Alert severity="error">{err}</Alert></Container>;
  if (!data) return null;

  return (
    <Container sx={{ py: 3 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 900 }}>{data.titre}</Typography>
          {data.est_certifie && <Chip size="small" color="success" icon={<VerifiedIcon/>} label="Certifié" />}
          <Chip size="small" color="secondary" label={`${data.prix_par_heure ?? "—"} ${data.devise||"EUR"}/h`} />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {data.games?.map(g => <Chip key={g} size="small" label={g} />)}
          {data.specialites?.map(s => <Chip key={s} size="small" variant="outlined" icon={<MilitaryTechIcon/>} label={s} />)}
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:2 }}>
            <Typography sx={{ fontWeight: 800, mb: .5 }}>Présentation</Typography>
            <Typography sx={{ opacity:.9 }}>
              {data.description || "Ce coach n’a pas encore rédigé de bio."}
            </Typography>
            <Divider sx={{ my:1.25, opacity:.2 }}/>
            <Typography sx={{ fontWeight: 800, mb: .5 }}>Palmarès</Typography>
            {!data.palmares?.length ? (
              <Typography variant="body2" sx={{ opacity:.8 }}>—</Typography>
            ) : (
              <Stack spacing={1}>
                {data.palmares.map(p => (
                  <Box key={p.id} sx={{ display:"flex", gap:1, alignItems:"center" }}>
                    <Chip size="small" icon={<CalendarMonthIcon/>} label={p.annee ?? "—"} />
                    <Typography sx={{ fontWeight:700 }}>{p.titre}</Typography>
                    {p.description && <Typography variant="body2" sx={{ opacity:.8 }}>— {p.description}</Typography>}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:2 }}>
            <Typography sx={{ fontWeight:800, mb:.5 }}>Indisponibilités (actives)</Typography>
            <Stack spacing={.75}>
              {!indispos.length && <Typography variant="body2" sx={{ opacity:.8 }}>—</Typography>}
              {indispos.map(i => (
                <Chip key={i.id}
                  label={i.type === "repetitif"
                    ? `${i.jour} ${i.heure_debut} → ${i.heure_fin}`
                    : `${i.date_unique} ${i.heure_debut} → ${i.heure_fin}`
                  }
                  variant="outlined"
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
