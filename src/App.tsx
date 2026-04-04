import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { init } from '@yunfie/search-js';
import { API_BASE } from './config';
import { useAppTheme } from './theme';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import Settings from './pages/Settings';
import Labs from './pages/Labs';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalAppStyles from './components/GlobalAppStyles';
import PageTransition from './components/PageTransition';

const AppContent: React.FC = () => {
  const location = useLocation();
  const scrollPositions = React.useRef<Record<string, number>>({});

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const savedPosition = scrollPositions.current[location.key];
    if (savedPosition !== undefined) {
      root.scrollTo(0, savedPosition);
    } else {
      root.scrollTo(0, 0);
    }
    const handleScroll = () => {
      scrollPositions.current[location.key] = root.scrollTop;
    };
    root.addEventListener('scroll', handleScroll);
    return () => root.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/labs" element={<Labs />} />
        </Routes>
      </PageTransition>
      <MobileBottomNav />
    </Box>
  );
};

const App: React.FC = () => {
  const theme = useAppTheme();
  useEffect(() => { init({ API_BASE }); }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalAppStyles />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
