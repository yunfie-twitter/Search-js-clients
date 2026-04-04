import React, { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, useMediaQuery } from '@mui/material';
import { init, SearchType } from '@yunfie/search-js';
import { API_BASE } from './config';
import HeaderNav from './components/HeaderNav';
import MainLayout from './components/MainLayout';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';
import Home from './pages/Home';
import HistoryPage from './pages/HistoryPage';
import Settings from './pages/Settings';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalAppStyles from './components/GlobalAppStyles';
import { useSearchStore } from './store/useSearchStore';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { performSearch } = useSearchStore();
  
  const query = searchParams.get('q') || '';
  const currentType = (searchParams.get('t') as SearchType) || 'web';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (query) {
      performSearch(query, currentType, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [query, currentType, page, performSearch]);

  const isGridLayout = currentType === 'image' || currentType === 'video';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <HeaderNav />
      <MainLayout isGridLayout={isGridLayout}>
        <SearchResults />
      </MainLayout>
      <Footer />
    </Box>
  );
};

import { useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  const location = useLocation();
  const scrollPositions = React.useRef<Record<string, number>>({});

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // 復元
    const savedPosition = scrollPositions.current[location.key];
    if (savedPosition !== undefined) {
      root.scrollTo(0, savedPosition);
    } else {
      root.scrollTo(0, 0);
    }

    // 保存用のスクロールイベント
    const handleScroll = () => {
      scrollPositions.current[location.key] = root.scrollTop;
    };

    root.addEventListener('scroll', handleScroll);
    return () => root.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <MobileBottomNav />
    </Box>
  );
};

const App: React.FC = () => {
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
        paper: isDark ? '#202124' : '#ffffff' 
      },
      primary: { main: isDark ? '#8ab4f8' : '#1a73e8' },
      text: { 
        primary: isDark ? '#e8eaed' : '#202124', 
        secondary: isDark ? '#bdc1c6' : '#70757a' 
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
            // バウンススクロールを全体で止める（iOS対策）
            overscrollBehavior: 'none',
            overflow: 'hidden', 
          },
          '#root': {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto', // ここでスクロールを管理
            WebkitOverflowScrolling: 'touch',
          },
          '& a': {
            color: isDark ? '#8ab4f8' : '#1a0dab',
          }
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: isDark ? '#8ab4f8' : '#1a0dab',
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? '#bdc1c6' : '#70757a', // text.secondary 相当の16進数
            '&.Mui-selected': {
              color: isDark ? '#8ab4f8' : '#1a73e8',
            }
          }
        }
      }
    }
  }), [isDark]);

  useEffect(() => {
    init({ API_BASE });
  }, []);

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
