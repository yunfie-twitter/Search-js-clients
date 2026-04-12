import React, { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SearchType } from '@yunfie/search-js';
import HeaderNav from '../components/HeaderNav';
import MainLayout from '../components/MainLayout';
import SearchResults from '../components/SearchResults';
import Footer from '../components/Footer';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import PageTransition from '../components/PageTransition';
import { useSearchStore } from '../store/useSearchStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useSwipePageNav } from '../hooks/useSwipePageNav';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const performSearch = useSearchStore(s => s.performSearch);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const query       = searchParams.get('q') || '';
  const currentType = (searchParams.get('t') as SearchType) || 'web';
  const page        = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (query) {
      performSearch(query, currentType, page);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [query, currentType, page, performSearch]);

  const handleRefresh = useCallback(() => {
    if (query) performSearch(query, currentType, page);
  }, [query, currentType, page, performSearch]);

  const { setIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const goNext = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', String(page + 1));
      return newParams;
    });
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [page, setSearchParams]);

  const goPrev = useCallback(() => {
    if (page <= 1) return;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', String(page - 1));
      return newParams;
    });
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [page, setSearchParams]);

  useSwipePageNav({ onNext: goNext, onPrev: goPrev });

  const isGridLayout = currentType === 'image' || currentType === 'video';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', // Use dynamic viewport height
      width: '100%',
      overflow: 'hidden',
      position: 'fixed', // Lock the base page position
      top: 0, left: 0, right: 0, bottom: 0,
    }}>
      <PullToRefreshIndicator ref={setIndicator} />
      
      <HeaderNav />

      {/* This is the ONLY scrollable container */}
      <Box
        ref={scrollContainerRef}
        id="search-scroll-container"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehaviorY: 'contain', // Prevent propagation to body
        }}
      >
        <PageTransition>
          <MainLayout isGridLayout={isGridLayout}>
            <SearchResults />
          </MainLayout>
          <Footer />
        </PageTransition>
      </Box>
    </Box>
  );
};

export default SearchPage;
