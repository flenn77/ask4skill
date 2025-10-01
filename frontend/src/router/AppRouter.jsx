// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Box, CircularProgress, Typography } from "@mui/material";

// --- Lazy pages (code splitting)
const Profile = lazy(() => import("../pages/Profile"));

// Auth
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ConfirmEmail = lazy(() => import("../pages/auth/ConfirmEmail"));

// Coach space
const CoachLayout = lazy(() => import("../components/CoachLayout"));
const CoachOffers = lazy(() => import("../pages/coach/Offers"));
const CoachDemandes = lazy(() => import("../pages/coach/Demandes"));
const CoachGamesSpecialties = lazy(() => import("../pages/coach/GamesSpecialties"));
const CoachPalmares = lazy(() => import("../pages/coach/Palmares"));

// Public / joueur
const CoachesList = lazy(() => import("../pages/explore/CoachesList"));
const CoachDetails = lazy(() => import("../pages/explore/CoachDetails"));
const PlayerDemandes = lazy(() => import("../pages/player/Demandes"));

// --- Fallback néon
function NeonFallback() {
  return (
    <Box sx={{
      display: "grid", placeItems: "center", minHeight: "45vh",
      textAlign: "center"
    }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: "50%",
        display: "grid", placeItems: "center",
        background: "radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,.25) 0%, rgba(34,211,238,.12) 100%)",
        boxShadow: "0 0 24px rgba(124,58,237,.35), inset 0 0 24px rgba(34,211,238,.18)",
        mb: 1.5
      }}>
        <CircularProgress size={28} sx={{ color: "#A78BFA" }} />
      </Box>
      <Typography sx={{ opacity: .9 }}>Chargement…</Typography>
    </Box>
  );
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<NeonFallback />}>
          <Routes>
            {/* Accueil -> explore */}
            <Route path="/" element={<Navigate to="/explore" replace />} />

            {/* Public */}
            <Route path="/explore" element={<CoachesList />} />
            <Route path="/coachs/:id" element={<CoachDetails />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/confirm" element={<ConfirmEmail />} />

            {/* User (email vérifié conseillé) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireVerified>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/demandes"
              element={
                <ProtectedRoute requireVerified>
                  <PlayerDemandes />
                </ProtectedRoute>
              }
            />

            {/* Coach (restreint au rôle COACH) */}
            <Route
              path="/coach"
              element={
                <ProtectedRoute roles={["COACH"]} requireVerified>
                  <CoachLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="offers" replace />} />
              <Route path="offers" element={<CoachOffers />} />
              <Route path="demandes" element={<CoachDemandes />} />
              <Route path="games" element={<CoachGamesSpecialties />} />
              <Route path="palmares" element={<CoachPalmares />} />
            </Route>

            {/* 404 → explore */}
            <Route path="*" element={<Navigate to="/explore" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
