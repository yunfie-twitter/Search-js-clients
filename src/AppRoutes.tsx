import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import Settings from './pages/Settings';
import Labs from './pages/Labs';
import MobileBottomNav from './components/MobileBottomNav';

// AppRoutes では PageTransition を使わない。
// 各ページ内部でコンテンツ部分のみを PageTransition で包む。
const AppRoutes: React.FC = () => {
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
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/labs" element={<Labs />} />
      </Routes>
      <MobileBottomNav />
    </Box>
  );
};

export default AppRoutes;
