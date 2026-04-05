import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SearchType } from '@yunfie/search-js';
import HeaderNav from '../components/HeaderNav';
import MainLayout from '../components/MainLayout';
import SearchResults from '../components/SearchResults';
import Footer from '../components/Footer';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import { useSearchStore } from '../store/useSearchStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useSwipePageNav } from '../hooks/useSwipePageNav';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { performSearch } = useSearchStore();

  const query       = searchParams.get('q') || '';
  const currentType = (searchParams.get('t') as SearchType) || 'web';
  const page        = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (query) {
      performSearch(query, currentType, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [query, currentType, page, performSearch]);

  // Pull-to-Refresh: 同じクエリを再検索
  const handleRefresh = useCallback(() => {
    if (query) performSearch(query, currentType, page);
  }, [query, currentType, page, performSearch]);

  const { setIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  // 左右スワイプでページ送り
  const goNext = useCallback(() => {
    setSearchParams({ q: query, t: currentType, page: String(page + 1) });
    window.scrollTo({ top: 0 });
  }, [query, currentType, page, setSearchParams]);

  const goPrev = useCallback(() => {
    if (page <= 1) return;
    setSearchParams({ q: query, t: currentType, page: String(page - 1) });
    window.scrollTo({ top: 0 });
  }, [query, currentType, page, setSearchParams]);

  useSwipePageNav({ onNext: goNext, onPrev: goPrev });

  const isGridLayout = currentType === 'image' || currentType === 'video';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <PullToRefreshIndicator ref={setIndicator} />
      <HeaderNav />
      <MainLayout isGridLayout={isGridLayout}>
        <SearchResults />
      </MainLayout>
      <Footer />
    </Box>
  );
};

export default SearchPage;
