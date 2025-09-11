// src/pages/coach/ProfileManage.jsx
import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Grid, Alert, CircularProgress, Snackbar } from "@mui/material";
import { NeonField, NeonButton } from "../../components/ui/Neon";
import api from "../../api/axios";

export default function ProfileManage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [snack, setSnack] = useState("");
  const [exists, setExists] = useState(false);
  const [f, setF] = useState({
    titre:"", devise:"EUR", prix_par_heure:"", prix_replay:"", prix_session_groupe:"",
    compte_stripe_id:"", disponible_actuellement:false, disponibilite_auto:false, est_certifie:false
  });

  const load = async () => {
    try {
      setLoading(true); setErr("");
      const { data } = await api.get("/coach/profile");
      setExists(true);
      setF({
        ...f,
        ...data,
        prix_par_heure: data.prix_par_heure ?? "",
        prix_replay: data.prix_replay ?? "",
        prix_session_groupe: data.prix_session_groupe ?? "",
        compte_stripe_id: data.compte_stripe_id ?? "",
      });
    } catch (e) {
      if (e?.response?.status === 404) setExists(false);
      else setErr(e.response?.data?.error || "Erreur chargement");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* init */ }, []); // eslint-disable-line

  const submit = async () => {
    try {
      const payload = { ...f };
      ["prix_par_heure","prix_replay","prix_session_groupe"].forEach(k => {
        if (payload[k] === "" || payload[k] == null) payload[k] = 0;
        else payload[k] = Number(payload[k]);
      });
      if (exists) {
        await api.patch("/coach/profile", payload);
        setSnack("Profil mis à jour");
      } else {
        await api.post("/coach/profile", payload);
        setSnack("Profil créé"); setExists(true);
      }
      load();
    } catch (e) {
      setErr(e.response?.data?.error || "Erreur de sauvegarde");
    }
  };

  if (loading) return <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress/></Stack>;

  return (
    <>
      <Paper sx={{ p:2, borderRadius:2, border:"1px solid rgba(124,58,237,.22)", bgcolor:"rgba(13,17,28,.6)" }}>
        <Stack spacing={1.25}>
          <Typography variant="h6" sx={{ fontWeight:900 }}>{exists ? "Mon profil coach" : "Créer mon profil coach"}</Typography>
          {err && <Alert severity="error">{err}</Alert>}
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={8}>
              <NeonField label="Titre" value={f.titre} onChange={e=>setF(s=>({ ...s, titre:e.target.value }))}/>
            </Grid>
            <Grid item xs={12} md={4}>
              <NeonField label="Devise (ISO 4217)" value={f.devise} onChange={e=>setF(s=>({ ...s, devise:e.target.value.toUpperCase() }))}/>
            </Grid>
            <Grid item xs={12} sm={4}><NeonField type="number" label="Prix / heure" value={f.prix_par_heure} onChange={e=>setF(s=>({ ...s, prix_par_heure:e.target.value }))}/></Grid>
            <Grid item xs={12} sm={4}><NeonField type="number" label="Prix replay" value={f.prix_replay} onChange={e=>setF(s=>({ ...s, prix_replay:e.target.value }))}/></Grid>
            <Grid item xs={12} sm={4}><NeonField type="number" label="Prix session groupe" value={f.prix_session_groupe} onChange={e=>setF(s=>({ ...s, prix_session_groupe:e.target.value }))}/></Grid>
            <Grid item xs={12} md={6}><NeonField label="Compte Stripe ID" value={f.compte_stripe_id} onChange={e=>setF(s=>({ ...s, compte_stripe_id:e.target.value }))}/></Grid>
            <Grid item xs={12} md={6}>
              <NeonField select label="Disponible actuellement" value={f.disponible_actuellement ? "1":"0"} onChange={e=>setF(s=>({ ...s, disponible_actuellement: e.target.value==="1" }))}>
                <option value="0">Non</option><option value="1">Oui</option>
              </NeonField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <NeonField select label="Disponibilité auto" value={f.disponibilite_auto ? "1":"0"} onChange={e=>setF(s=>({ ...s, disponibilite_auto: e.target.value==="1" }))}>
                <option value="0">Non</option><option value="1">Oui</option>
              </NeonField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <NeonField select label="Certifié" value={f.est_certifie ? "1":"0"} onChange={e=>setF(s=>({ ...s, est_certifie: e.target.value==="1" }))}>
                <option value="0">Non</option><option value="1">Oui</option>
              </NeonField>
            </Grid>
          </Grid>
          <NeonButton onClick={submit}>{exists ? "Sauvegarder" : "Créer"}</NeonButton>
        </Stack>
      </Paper>
      <Snackbar
        open={!!snack} autoHideDuration={2500} onClose={()=>setSnack("")}
        message={snack}
      />
    </>
  );
}
