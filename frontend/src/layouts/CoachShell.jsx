// src/layouts/CoachShell.jsx
import { NavLink, Outlet } from "react-router-dom";
import { Box, Container, Stack, Tabs, Tab, Paper } from "@mui/material";

const tabs = [
  { to: "/coach/profile", label: "Profil" },
  { to: "/coach/games", label: "Jeux" },
  { to: "/coach/specialites", label: "Spécialités" },
  { to: "/coach/palmares", label: "Palmarès" },
  { to: "/coach/indispos", label: "Indisponibilités" },
];

export default function CoachShell() {
  return (
    <Box sx={{ py: 2 }}>
      <Container maxWidth="lg">
        <Paper elevation={8} sx={{
          p: 1, mb: 2, borderRadius: 2, bgcolor: "rgba(13,17,28,.6)",
          border: "1px solid rgba(124,58,237,.22)",
        }}>
          <Tabs value={false} variant="scrollable" scrollButtons="auto">
            {tabs.map(t => (
              <Tab
                key={t.to}
                label={t.label}
                value={t.to}
                component={NavLink}
                to={t.to}
                sx={{ "&.active": { color: "primary.main", fontWeight: 800 } }}
              />
            ))}
          </Tabs>
        </Paper>
        <Stack><Outlet/></Stack>
      </Container>
    </Box>
  );
}
