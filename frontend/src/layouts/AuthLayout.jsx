// src/layouts/AuthLayout.jsx
import { Box, Container } from "@mui/material";

export default function AuthLayout({ children, compact = false }) {
  return (
    <Box
      sx={{
        // On réserve toute la hauteur visible, moins ~64px de navbar
        minHeight: "calc(100dvh - 64px)",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: compact ? 2 : 4,
        // même fond néon que le reste
        background:
          "radial-gradient(900px 600px at 85% 20%, rgba(124,58,237,.25), transparent 50%), linear-gradient(120deg,#030711 0%,#0B1020 60%,#090a14 100%)",
      }}
    >
      <Container maxWidth={compact ? "sm" : "md"} sx={{ px: { xs: 0, sm: 2 } }}>
        {children}
      </Container>
    </Box>
  );
}
