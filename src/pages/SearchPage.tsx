import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SearchType } from '@yunfie/search-js';
import HeaderNav from '../components/HeaderNav';
import MainLayout from '../components/MainLayout';
import SearchResults from '../components/SearchResults';
import Footer from '../components/Footer';
import { useSearchStore } from '../store/useSearchStore';

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

export default SearchPage;
