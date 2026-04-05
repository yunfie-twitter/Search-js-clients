import { useMemo } from 'react';
import { createTheme, useMediaQuery } from '@mui/material';
import { useSearchStore } from './store/useSearchStore';

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const useAppTheme = () => {
  const { themeMode } = useSearchStore();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const isDark = useMemo(() => {
    if (themeMode === 'system') return prefersDarkMode;
    return themeMode === 'dark';
  }, [themeMode, prefersDarkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: isDark ? '#0d0d0f' : '#f5f5f7',
        paper:   isDark ? '#1c1c1e' : '#ffffff',
      },
      primary: {
        main:  isDark ? '#0a84ff' : '#007aff',
        light: isDark ? '#409cff' : '#3395ff',
        dark:  isDark ? '#0060df' : '#005ec4',
      },
      secondary: {
        main: isDark ? '#30d158' : '#34c759',
      },
      error:   { main: isDark ? '#ff453a' : '#ff3b30' },
      warning: { main: isDark ? '#ffd60a' : '#ffcc00' },
      info:    { main: isDark ? '#64d2ff' : '#32ade6' },
      success: { main: isDark ? '#30d158' : '#34c759' },
      text: {
        primary:   isDark ? '#f2f2f7' : '#1c1c1e',
        secondary: isDark ? '#8e8e93' : '#6c6c70',
        disabled:  isDark ? '#3a3a3c' : '#c7c7cc',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    },

    typography: {
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.1 },
      h2: { fontWeight: 700, letterSpacing: '-0.018em', lineHeight: 1.15 },
      h3: { fontWeight: 600, letterSpacing: '-0.014em', lineHeight: 1.2 },
      h4: { fontWeight: 600, letterSpacing: '-0.012em' },
      h5: { fontWeight: 600, letterSpacing: '-0.010em' },
      h6: { fontWeight: 600, letterSpacing: '-0.010em' },
      body1: { fontSize: '17px', lineHeight: 1.65, letterSpacing: '-0.005em' },
      body2: { fontSize: '14px', lineHeight: 1.55, letterSpacing: '0em' },
      caption: { fontSize: '12px', letterSpacing: '0.01em' },
      button: { fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' },
      subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
      subtitle2: { fontWeight: 500, letterSpacing: '0em' },
    },

    shape: { borderRadius: 12 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body': {
            backgroundColor: isDark ? '#0d0d0f' : '#f5f5f7',
            color: isDark ? '#f2f2f7' : '#1c1c1e',
            colorScheme: isDark ? 'dark' : 'light',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            overscrollBehavior: 'none',
            overflow: 'hidden',
          },
          '#root': {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          },
          '& a': { color: isDark ? '#0a84ff' : '#007aff' },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '10px 20px',
            transition: `all 120ms ${SPRING}`,
            boxShadow: 'none',
            '&:active': { transform: 'scale(0.95)', opacity: 0.85 },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 2px 12px ${isDark ? 'rgba(10,132,255,0.35)' : 'rgba(0,122,255,0.22)'}` },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            transition: `transform 120ms ${SPRING}, opacity 120ms ease, background-color 120ms ${SPRING}`,
            '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' },
            '&:active': { transform: 'scale(0.88)', opacity: 0.65 },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '16px',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(28,28,30,0.94)' : 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            transition: `background-color 120ms ${SPRING}, transform 120ms ${SPRING}`,
            '&:active': { transform: 'scale(0.98)' },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
            transition: `all 120ms ${SPRING}`,
            '&:active': { transform: 'scale(0.95)' },
          },
        },
      },

      MuiLink: {
        styleOverrides: {
          root: { color: isDark ? '#0a84ff' : '#007aff' },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? '#8e8e93' : '#6c6c70',
            transition: `color 120ms ${SPRING}`,
            '&.Mui-selected': { color: isDark ? '#0a84ff' : '#007aff' },
          },
        },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: { borderRadius: '8px' },
          wave: {
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}, transparent)`,
            },
          },
        },
      },

      MuiSnackbar: {
        styleOverrides: {
          root: { bottom: 'calc(80px + env(safe-area-inset-bottom))' },
        },
      },
    },
  }), [isDark]);

  return theme;
};
