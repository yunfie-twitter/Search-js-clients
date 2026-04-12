import React, { useEffect, memo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { init } from '@yunfie/search-js';
import { getApiBase } from './config';
import { useAppTheme } from './theme';
import GlobalAppStyles from './components/GlobalAppStyles';
import AppRoutes from './AppRoutes';
import { useSearchStore } from './store/useSearchStore';
import { useLenis } from './hooks/useLenis';
import { useNativeGestures } from './hooks/useNativeGestures';
import { initSync, stopSync } from './utils/sync';

const AppInner: React.FC = memo(() => {
  const expLenis = useSearchStore((s) => s.expLenis);
  const enableSync = useSearchStore((s) => s.enableSync);
  const syncGroupId = useSearchStore((s) => s.syncGroupId);

  useLenis(expLenis);
  useNativeGestures();

  useEffect(() => {
    if (enableSync && syncGroupId) {
      initSync();
    } else {
      stopSync();
    }
  }, [enableSync, syncGroupId]);

  return <AppRoutes />;
});

const App: React.FC = memo(() => {
  const theme = useAppTheme();

  // Initialize search-js
  useEffect(() => {
    init({ API_BASE: getApiBase(), TIMEOUT: 20000 });
  }, []);

  // Update theme-color meta tag based on current theme background
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const color = theme.palette.background.default;
    if (meta) {
      meta.setAttribute('content', color);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = color;
      document.head.appendChild(newMeta);
    }
  }, [theme.palette.background.default]);

  // Disable pinch zoom and double tap zoom for a native app feel
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalAppStyles />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  );
});

export default App;
