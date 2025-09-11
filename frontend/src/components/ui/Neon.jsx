// src/components/ui/Neon.jsx
import { styled } from "@mui/material/styles";
import { TextField, Button } from "@mui/material";

const fieldBg = "rgba(17,21,33,.55)";
const textCol = "#E6E6F0";

export const NeonField = styled(TextField)({
  "& .MuiInputBase-root": {
    height: 44, background: fieldBg, backdropFilter: "blur(8px)",
    borderRadius: 12, color: textCol, fontSize: 14, transition: "all .2s ease",
  },
  "& .MuiInputBase-multiline": { height: "auto" },
  "& .MuiInputBase-input": { padding: "12px 12px" },
  "& .MuiInputBase-inputMultiline": { padding: "12px 12px" },
  "& .MuiSelect-select": { height: "44px !important", display: "flex", alignItems: "center", padding: "12px 12px" },
  "& input:-webkit-autofill, & .MuiSelect-select:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${fieldBg} inset`,
    WebkitTextFillColor: textCol, caretColor: textCol, borderRadius: 12,
    transition: "background-color 9999s ease-out 0s",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(168,139,250,.22)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(168,139,250,.45)", boxShadow: "0 0 0 2px rgba(124,58,237,.18)" },
  "& label": { color: "rgba(230,230,240,.65)", fontSize: 13 },
  "& label.Mui-focused": { color: "#C084FC", textShadow: "0 0 8px rgba(192,132,252,.35)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7C3AED", boxShadow: "0 0 0 3px rgba(124,58,237,.22), inset 0 0 20px rgba(34,211,238,.08)"
  },
  "& .MuiInputAdornment-root, & .MuiSvgIcon-root": { color: "rgba(230,230,240,.75)" },
});

export const NeonButton = styled(Button)({
  height: 46, minHeight: 46, borderRadius: 12, fontWeight: 800, fontSize: 14, letterSpacing: ".25px",
  textTransform: "none",
  background: "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(34,211,238,1) 100%)",
  boxShadow: "0 10px 32px rgba(124,58,237,.32), 0 0 20px rgba(34,211,238,.22)",
  transition: "all .2s ease",
  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 14px 40px rgba(124,58,237,.42), 0 0 26px rgba(34,211,238,.3)" },
});
