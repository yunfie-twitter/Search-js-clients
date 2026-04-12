import React, { Suspense, lazy, memo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import MobileBottomNav from './components/MobileBottomNav';
import { useSearchStore } from './store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';

const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Labs = lazy(() => import('./pages/Labs'));
const WidgetSettings = lazy(() => import('./pages/WidgetSettings'));
const Devices = lazy(() => import('./pages/Devices'));
const ImageSearchResultPage = lazy(() => import('./pages/ImageSearchResultPage'));
const MarkdownViewer = lazy(() => import('./pages/MarkdownViewer'));
const NotFound = lazy(() => import('./pages/NotFound'));

const VideoPlayerDialog = lazy(() => import('./components/VideoPlayerDialog'));

const Fallback = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100dvh', 
    width: '100%',
    backgroundColor: 'background.default'
  }}>
    <CircularProgress size={32} thickness={4} sx={{ color: 'primary.main', opacity: 0.6 }} />
  </Box>
);

const GlobalVideoPlayer = memo(() => {
  const { activeVideo, setActiveVideo, results } = useSearchStore(
    useShallow(s => ({
      activeVideo: s.activeVideo,
      setActiveVideo: s.setActiveVideo,
      results: s.results
    }))
  );

  if (!activeVideo) return null;

  return (
    <Suspense fallback={null}>
      <VideoPlayerDialog 
        item={activeVideo} 
        onClose={() => setActiveVideo(null)} 
        relatedResults={results} 
        onSelectRelated={setActiveVideo} 
      />
    </Suspense>
  );
});

const AppRoutes: React.FC = memo(() => {
  const expUnlocked = useSearchStore(s => s.expUnlocked);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', 
      width: '100%', 
      overflow: 'hidden' 
    }}>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/search"       element={<SearchPage />} />
          <Route path="/history"      element={<HistoryPage />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="/device"       element={<Devices />} />
          <Route path="/labs"         element={expUnlocked ? <Labs /> : <NotFound />} />
          <Route path="/widget"       element={expUnlocked ? <WidgetSettings /> : <NotFound />} />
          <Route path="/image-search" element={<ImageSearchResultPage />} />
          <Route path="/markdown-viewer" element={<MarkdownViewer />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Suspense>
      <MobileBottomNav />
      
      {/* Global Video Player */}
      <GlobalVideoPlayer />
    </Box>
  );
});

export default AppRoutes;
