// src/theme/futureTheme.js
import { createTheme } from '@mui/material/styles';

const cosmos = {
  mode: 'dark',
  primary:  { main: '#7C3AED' },     // violet néon
  secondary:{ main: '#00E5FF' },     // cyan néon
  info:     { main: '#22D3EE' },
  success:  { main: '#22C55E' },
  warning:  { main: '#F59E0B' },
  error:    { main: '#F43F5E' },
  background: {
    default: '#05060F',              // nuit profonde
    paper:   'rgba(14, 20, 35, 0.6)' // verre dépoli
  },
  text: {
    primary:  '#E2E8F0',
    secondary:'#9CA3AF'
  },
};

const theme = createTheme({
  palette: cosmos,
  typography: {
    fontFamily: ['Inter','SF Pro Display','Segoe UI','Roboto','system-ui'].join(','),
    h1: { fontWeight: 900, letterSpacing: '.5px' },
    h4: { fontWeight: 800, letterSpacing: '.4px' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '.3px' },
  },
  shape: { borderRadius: 16 },
  shadows: Array(25).fill('none').map((_,i) =>
    i < 1 ? 'none'
    : `0 8px 30px rgba(0,0,0,.35), 0 0 0 ${Math.min(i,3)}px rgba(124,58,237,.1)`
  ),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Fond cosmos: mesh + étoiles + bruit léger
        body: {
          minHeight: '100vh',
          background:
            `radial-gradient(1200px 700px at 80% -10%, rgba(124,58,237,.25), transparent 60%),
             radial-gradient(900px 600px at -10% 110%, rgba(0,229,255,.18), transparent 55%),
             linear-gradient(180deg, #05060F 0%, #070A16 60%, #05060F 100%)`,
          backgroundAttachment: 'fixed',
          position: 'relative',
          overflowX: 'hidden',
        },
        'body::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(1px 1px at 25% 15%, rgba(255,255,255,.12), transparent 60%),
                            radial-gradient(1px 1px at 75% 65%, rgba(255,255,255,.08), transparent 60%)`,
          opacity: .2,
          pointerEvents: 'none',
        },
        'body::after': {
          content: '""',
          position: 'fixed',
          inset: 0,
          background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...")',
          opacity: .03,
          pointerEvents: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backdropFilter: 'blur(14px)',
          background: cosmos.background.paper,
          border: '1px solid rgba(148,163,184,.18)',
          boxShadow:
            '0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true, variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all .25s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(124,58,237,.6)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: cosmos.primary.main,
              boxShadow: `0 0 0 4px rgba(124,58,237,.18), 0 0 20px rgba(124,58,237,.35)`,
            },
            '& input': { paddingTop: 14, paddingBottom: 14 },
          },
          '& .MuiInputAdornment-root': { color: '#A5B4FC' },
          '& label.Mui-focused': { color: cosmos.primary.main },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'large' },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          transition: 'transform .15s ease, box-shadow .25s ease, filter .25s ease',
          willChange: 'transform, box-shadow',
          '&:hover': { transform: 'translateY(-1px)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%)',
          boxShadow:
            '0 0 0 2px rgba(124,58,237,.25) inset, 0 16px 40px rgba(124,58,237,.25)',
          '&:hover': {
            filter: 'brightness(1.05)',
            boxShadow:
              '0 0 0 2px rgba(124,58,237,.35) inset, 0 22px 60px rgba(124,58,237,.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(148,163,184,.35)',
          background: 'rgba(14,20,35,.35)',
          '&:hover': {
            borderColor: cosmos.secondary.main,
            boxShadow: '0 10px 30px rgba(0,229,255,.15)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(148,163,184,.18)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          textDecorationColor: 'rgba(0,229,255,.35)',
          '&:hover': { textDecorationColor: cosmos.secondary.main },
        },
      },
    },
  },
});

export default theme;
