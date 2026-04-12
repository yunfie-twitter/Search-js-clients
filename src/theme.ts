import { useMemo } from 'react';
import { createTheme, useMediaQuery } from '@mui/material';
import { useSearchStore } from './store/useSearchStore';

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const useAppTheme = () => {
  const themeMode = useSearchStore((s) => s.themeMode);
  const expCustomAccentColor = useSearchStore((s) => s.expCustomAccentColor);
  const accentColor = useSearchStore((s) => s.accentColor);
  const expCustomFontSize = useSearchStore((s) => s.expCustomFontSize);
  const fontSizeBase = useSearchStore((s) => s.fontSizeBase);
  const expColorBlindMode = useSearchStore((s) => s.expColorBlindMode);
  const expDynamicGradient = useSearchStore((s) => s.expDynamicGradient);
  const expFrostGlass = useSearchStore((s) => s.expFrostGlass);
  const expJustifyText = useSearchStore((s) => s.expJustifyText);
  const expSpringCard = useSearchStore((s) => s.expSpringCard);
  const expHoverElevation = useSearchStore((s) => s.expHoverElevation);
  const expEnhancedRipple = useSearchStore((s) => s.expEnhancedRipple);
  const expLowEndMode = useSearchStore((s) => s.expLowEndMode);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const isDark = useMemo(() => {
    if (themeMode === 'system') return prefersDarkMode;
    return themeMode === 'dark';
  }, [themeMode, prefersDarkMode]);

  const defaultPrimaryMainDark = expColorBlindMode ? '#5e81ac' : '#0a84ff';
  const defaultPrimaryMainLight = expColorBlindMode ? '#3b82f6' : '#007aff';
  const errorMain   = expColorBlindMode ? (isDark ? '#e17055' : '#b91c1c') : (isDark ? '#ff453a' : '#ff3b30');
  const successMain = expColorBlindMode ? (isDark ? '#8fbc8f' : '#059669') : (isDark ? '#30d158' : '#34c759');
  const warningMain = expColorBlindMode ? (isDark ? '#ebcb8b' : '#d97706') : (isDark ? '#ffd60a' : '#ffcc00');
  const infoMain    = expColorBlindMode ? (isDark ? '#81a1c1' : '#0284c7') : (isDark ? '#64d2ff' : '#32ade6');
  
  const primaryMain = (expCustomAccentColor && accentColor) ? accentColor : (isDark ? defaultPrimaryMainDark : defaultPrimaryMainLight);

  const baseSize = expCustomFontSize ? fontSizeBase : 17;
  const sizeRatio = baseSize / 17;

  let defaultBg = isDark ? '#0B0B0F' : '#f5f5f7';
  let paperBg   = isDark ? '#14141A' : '#ffffff';

  if (expDynamicGradient && !expLowEndMode) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) { defaultBg = isDark ? '#1A1510' : '#FFF0E5'; }
    else if (hour >= 10 && hour < 16) { defaultBg = isDark ? '#0F1626' : '#E8F0FE'; }
    else if (hour >= 16 && hour < 19) { defaultBg = isDark ? '#261518' : '#FFE5E5'; }
    else { defaultBg = isDark ? '#0A0A12' : '#EAEBF4'; }
  }

  if (expFrostGlass && !expLowEndMode) {
    paperBg = isDark ? 'rgba(20, 20, 26, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  }

  const cardActiveTransform = (expSpringCard && !expLowEndMode) ? 'scale(0.97)' : 'scale(0.95)';
  const cardActiveTransition = (expSpringCard && !expLowEndMode) ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)';
  
  const rippleStyles = useMemo(() => {
    if (expLowEndMode) return { display: 'none' };
    return expEnhancedRipple ? {
      '& .MuiTouchRipple-child': {
        backgroundColor: primaryMain,
        animationDuration: '400ms',
      }
    } : {};
  }, [expEnhancedRipple, expLowEndMode, primaryMain]);

  const theme = useMemo(() => {
    // shadows は undefined ではなく、必要に応じて完全に上書きするかデフォルトを使用させる
    const themeConfig: any = {
      palette: {
        mode: isDark ? 'dark' : 'light',
        background: { default: defaultBg, paper: paperBg },
        primary: { main: primaryMain },
        secondary: { main: successMain },
        error: { main: errorMain },
        warning: { main: warningMain },
        info: { main: infoMain },
        success: { main: successMain },
        text: {
          primary: isDark ? '#f2f2f7' : '#1c1c1e',
          secondary: isDark ? '#8e8e93' : '#6c6c70',
        },
        divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
      },
      typography: {
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        body1: { fontSize: `${baseSize}px`, lineHeight: 1.65, letterSpacing: '-0.005em', ...(expJustifyText ? { textAlign: 'justify' } : {}) },
        body2: { fontSize: `${14 * sizeRatio}px`, lineHeight: 1.55, letterSpacing: '0em', ...(expJustifyText ? { textAlign: 'justify' } : {}) },
        button: { fontWeight: 600, textTransform: 'none' },
      },
      shape: { borderRadius: expLowEndMode ? 4 : 12 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            'html, body': {
              backgroundColor: defaultBg,
              color: isDark ? '#f2f2f7' : '#1c1c1e',
              margin: 0,
              padding: 0,
              width: '100%',
              minHeight: '100%',
              WebkitTapHighlightColor: 'transparent',
            },
            '#root': {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minHeight: '100vh',
            },
            '.pm-result-card': {
              '&:active': {
                 transform: expLowEndMode ? 'none' : `${cardActiveTransform} !important`,
                 transition: expLowEndMode ? 'none' : `${cardActiveTransition} !important`,
              }
            }
          },
        },
        MuiButton: {
          defaultProps: { disableRipple: expLowEndMode, disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: expLowEndMode ? '4px' : '12px',
              transition: expLowEndMode ? 'none' : `transform 120ms ${SPRING}`,
              '&:active': { transform: expLowEndMode ? 'none' : cardActiveTransform },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: { 
              backgroundImage: 'none', 
              boxShadow: expLowEndMode ? 'none' : undefined,
              border: expLowEndMode ? '1px solid var(--mui-palette-divider)' : 'none',
              ...(expFrostGlass && !expLowEndMode ? { backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } : {}) 
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: expLowEndMode ? '8px' : '24px', 
              backdropFilter: expLowEndMode ? 'none' : 'blur(40px)',
              WebkitBackdropFilter: expLowEndMode ? 'none' : 'blur(40px)',
            },
          },
        },
      },
    };

    if (expLowEndMode) {
      themeConfig.shadows = Array(25).fill('none');
    }

    return createTheme(themeConfig);
  }, [isDark, primaryMain, sizeRatio, baseSize, successMain, errorMain, warningMain, infoMain, defaultBg, paperBg, expJustifyText, expHoverElevation, cardActiveTransform, cardActiveTransition, rippleStyles, expFrostGlass, expLowEndMode]);

  return theme;
};
