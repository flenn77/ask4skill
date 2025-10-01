// src/components/CoachLayout.jsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Box, Paper, Tabs, Tab } from "@mui/material";

export default function CoachLayout() {
  const location = useLocation();

  const tabs = [
    { to: "/coach/offers", label: "Offres" },
    { to: "/coach/demandes", label: "Demandes" },
    { to: "/coach/games", label: "Jeux & Spécialités" },
    { to: "/coach/palmares", label: "Palmarès" },
  ];

  const currentIndex = tabs.findIndex((t) => location.pathname.startsWith(t.to));

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, border: "1px solid rgba(124,58,237,.22)" }}>
        <Tabs value={currentIndex < 0 ? 0 : currentIndex} variant="scrollable" allowScrollButtonsMobile>
          {tabs.map((t) => (
            <Tab
              key={t.to}
              label={t.label}
              component={NavLink}
              to={t.to}
              sx={{ textTransform: "none", fontWeight: 800 }}
            />
          ))}
        </Tabs>
      </Paper>
      <Outlet />
    </Box>
  );
}
