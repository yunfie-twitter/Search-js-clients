import { useMemo } from 'react';
import { createTheme, useMediaQuery } from '@mui/material';
import { useSearchStore } from './store/useSearchStore';

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
        default: isDark ? '#171717' : '#ffffff',
        paper: isDark ? '#202124' : '#ffffff',
      },
      primary: { main: isDark ? '#8ab4f8' : '#1a73e8' },
      text: {
        primary: isDark ? '#e8eaed' : '#202124',
        secondary: isDark ? '#bdc1c6' : '#70757a',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body': {
            backgroundColor: isDark ? '#171717' : '#ffffff',
            color: isDark ? '#e8eaed' : '#202124',
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
          },
          '& a': {
            color: isDark ? '#8ab4f8' : '#1a0dab',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: isDark ? '#8ab4f8' : '#1a0dab',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? '#bdc1c6' : '#70757a',
            '&.Mui-selected': {
              color: isDark ? '#8ab4f8' : '#1a73e8',
            },
          },
        },
      },
    },
  }), [isDark]);

  return theme;
};
