// src/components/ProtectedCoachRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Stack, Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedCoachRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}><CircularProgress/></Box>;
  }
  const ok = user && [2,3].includes(Number(user.role_id)); // 2=COACH, 3=ADMIN
  if (!user) return <Navigate to="/login" replace />;
  if (!ok) {
    return (
      <Box sx={{ display:"grid", placeItems:"center", minHeight:"50vh", px:2 }}>
        <Stack spacing={2} maxWidth={480} sx={{ width:"100%" }}>
          <Alert severity="warning" variant="filled" sx={{ fontWeight:700 }}>
            Accès réservé aux coachs.
          </Alert>
          <Button variant="outlined" href="/profile" sx={{ borderRadius:2 }}>
            Revenir à mon profil
          </Button>
        </Stack>
      </Box>
    );
  }
  return children;
}
