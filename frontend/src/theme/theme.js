// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import { PALETTES } from './palettes';

const active = PALETTES.neonNight; // ← change juste ceci pour switcher

export const theme = createTheme({
  palette: {
    mode: active.mode,
    primary: active.primary,
    secondary: active.secondary,
    background: active.background,
    text: active.text,
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#F43F5E' },
    info: { main: '#06B6D4' },
  },
  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'].join(', '),
    h4: { fontWeight: 800, letterSpacing: '0.5px' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.3px' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: active.gradient,               // dégradé global
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          background:
            active.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.7)'
              : 'rgba(255, 255, 255, 0.7)',
          boxShadow:
            '0 10px 25px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.04)',
          border: active.mode === 'dark' ? '1px solid rgba(148,163,184,.2)' : '1px solid rgba(2,6,23,.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backdropFilter: 'blur(6px)',
            transition: 'all .2s ease',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'large', disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)',
        },
      },
    },
    MuiLink: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});
