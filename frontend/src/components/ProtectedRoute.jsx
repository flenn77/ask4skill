// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

/**
 * Props :
 *  - roles?: string[]  -> ex: ['COACH']
 *  - requireVerified?: boolean
 */
export default function ProtectedRoute({ children, roles, requireVerified = false }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireVerified && user.is_email_verified === false) {
    return <Navigate to="/confirm" replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const myRole = (user?.role?.nom || user?.role_nom || "").toUpperCase();
    if (!roles.map((r) => r.toUpperCase()).includes(myRole)) {
      return <Navigate to="/explore" replace />;
    }
  }

  return children;
}
