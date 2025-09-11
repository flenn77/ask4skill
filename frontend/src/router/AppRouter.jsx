// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Profile from "../pages/Profile";
import Coaches from "../pages/Coaches";
import CoachDetail from "../pages/CoachDetail";
import Bookings from "../pages/Bookings";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedCoachRoute from "../components/ProtectedCoachRoute";
import CoachShell from "../layouts/CoachShell";

// auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ConfirmEmail from "../pages/auth/ConfirmEmail";

// coach private pages
import CoachProfileManage from "../pages/coach/ProfileManage";
import CoachGamesManage from "../pages/coach/GamesManage";
import CoachSpecialitesManage from "../pages/coach/SpecialitesManage";
import CoachPalmaresManage from "../pages/coach/PalmaresManage";
import CoachIndisposManage from "../pages/coach/IndisposManage";

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Coaches />} />
          <Route path="/coachs/:id" element={<CoachDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/confirm" element={<ConfirmEmail />} />

          {/* User */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute><Bookings /></ProtectedRoute>
            }
          />

          {/* Coach space */}
          <Route
            path="/coach"
            element={
              <ProtectedCoachRoute><CoachShell /></ProtectedCoachRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<CoachProfileManage />} />
            <Route path="games" element={<CoachGamesManage />} />
            <Route path="specialites" element={<CoachSpecialitesManage />} />
            <Route path="palmares" element={<CoachPalmaresManage />} />
            <Route path="indispos" element={<CoachIndisposManage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
