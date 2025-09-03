// src/components/Navbar.jsx
import { useState, useContext, useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Container, Box, Stack, Button, IconButton,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Avatar, Tooltip
} from "@mui/material";

import MenuIcon from "@mui/icons-material/MenuRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";

import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = useMemo(
    () => [
      { to: "/", label: "Coachs", icon: <SportsEsportsIcon /> },
      ...(user
        ? [
            { to: "/bookings", label: "Réservations", icon: <CalendarMonthIcon /> },
            { to: "/profile", label: "Profil", icon: <PersonIcon /> },
          ]
        : []),
    ],
    [user]
  );

  const initial =
    (user?.pseudo || user?.prenom || user?.email || "A").slice(0, 1).toUpperCase();

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          px: 0,
          bgcolor: "rgba(5,6,15,0.55)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(148,163,184,.15)",
          boxShadow: "0 10px 40px rgba(0,0,0,.45)",
        }}
      >
        <Container maxWidth="lg">
          {/* Toolbar compactée */}
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 52, md: 58 }, // plus bas que par défaut
              py: 0,
            }}
          >
            {/* LOGO + Nom */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                mr: 2,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Ask4Skill"
                sx={{
                  width: 26,
                  height: 26,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(124,58,237,.65))",
                }}
              />
              <Box
                sx={{
                  fontWeight: 900,
                  letterSpacing: ".4px",
                  fontSize: 16,
                  lineHeight: 1,
                  background: "linear-gradient(90deg,#A78BFA,#22D3EE)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Ask4Skill
              </Box>
            </Box>

            {/* NAV (desktop) */}
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ ml: 1, display: { xs: "none", md: "flex" } }}
            >
              {links.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <Button
                    key={l.to}
                    component={RouterLink}
                    to={l.to}
                    startIcon={l.icon}
                    size="small"
                    variant={active ? "contained" : "text"}
                    color={active ? "primary" : "inherit"}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 9,
                      fontSize: 13,
                      ...(active
                        ? {}
                        : {
                            color: "text.secondary",
                            "&:hover": {
                              color: "text.primary",
                              backgroundColor: "rgba(124,58,237,.08)",
                            },
                          }),
                    }}
                  >
                    {l.label}
                  </Button>
                );
              })}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {/* ACTIONS (desktop) */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {!user ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="small"
                    startIcon={<LoginIcon />}
                    sx={{ px: 1.25, py: 0.5, borderRadius: 9, fontSize: 13 }}
                  >
                    Connexion
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="small"
                    startIcon={<AppRegistrationIcon />}
                    sx={{ px: 1.25, py: 0.5, borderRadius: 9, fontSize: 13 }}
                  >
                    Inscription
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip title={user.email}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        boxShadow: "0 0 16px rgba(124,58,237,.45)",
                      }}
                    >
                      {initial}
                    </Avatar>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                    sx={{ px: 1.25, py: 0.5, borderRadius: 9, fontSize: 13 }}
                  >
                    Déconnexion
                  </Button>
                </>
              )}
            </Stack>

            {/* MENU (mobile) */}
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, ml: "auto" }}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: "rgba(14,20,35,.9)",
            backdropFilter: "blur(12px)",
            borderLeft: "1px solid rgba(148,163,184,.18)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
              {initial}
            </Avatar>
            <Box sx={{ fontWeight: 800, fontSize: 14 }}>
              {user ? user.pseudo || user.email : "Bienvenue"}
            </Box>
          </Stack>
        </Box>
        <Divider />
        <List sx={{ p: 1 }}>
          {links.map((l) => (
            <ListItemButton
              key={l.to}
              component={RouterLink}
              to={l.to}
              selected={location.pathname === l.to}
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: "rgba(124,58,237,.14)",
                  border: "1px solid rgba(124,58,237,.35)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "text.secondary", minWidth: 36 }}>
                {l.icon}
              </ListItemIcon>
              <ListItemText primary={l.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ p: 1.25 }}>
          {user ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => {
                logout();
                setOpen(false);
              }}
              sx={{ borderRadius: 9 }}
            >
              Déconnexion
            </Button>
          ) : (
            <Stack spacing={0.75}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LoginIcon />}
                component={RouterLink}
                to="/login"
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 9 }}
              >
                Connexion
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AppRegistrationIcon />}
                component={RouterLink}
                to="/register"
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 9 }}
              >
                Inscription
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </>
  );
}
