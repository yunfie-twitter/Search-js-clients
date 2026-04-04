import React, { useMemo } from 'react';
import { Box, Container, Button, Tabs, Tab } from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  ImageSearchOutlined as ImageSearchIcon,
} from '@mui/icons-material';
import Logo from '../components/Logo';
import SearchBox from '../components/SearchBox';
import ImageSearch from '../components/ImageSearch';
import Footer from '../components/Footer';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const Home: React.FC = () => {
  const language      = useSearchStore((s) => s.language);
  const setLanguage   = useSearchStore((s) => s.setLanguage);
  const expImageSearch = useSearchStore((s) => s.expImageSearch);
  const t = useMemo(() => translations[language], [language]);

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="text"
          onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
          sx={{ color: 'text.primary', textTransform: 'none' }}
        >
          {language === 'ja' ? 'English' : '日本語'}
        </Button>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: { xs: -4, md: -12 },
          px: 3,
          pb: { xs: '80px', md: 0 },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Logo size="large" />
        </Box>

        {/* 実験的機能が有効なときだけタブを表示 */}
        {expImageSearch && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', minHeight: 40, fontSize: '14px' } }}
          >
            <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label={t.search} />
            <Tab icon={<ImageSearchIcon fontSize="small" />} iconPosition="start" label={t.imageSearch} />
          </Tabs>
        )}

        {/* タブに応じたコンテンツ */}
        {activeTab === 0 || !expImageSearch ? (
          <SearchBox variant="home" />
        ) : (
          <ImageSearch />
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default Home;
