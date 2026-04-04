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
  const language       = useSearchStore((s) => s.language);
  const setLanguage    = useSearchStore((s) => s.setLanguage);
  const expImageSearch = useSearchStore((s) => s.expImageSearch);
  const t = useMemo(() => translations[language], [language]);

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        pt: 'calc(env(safe-area-inset-top) + 12px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <Button
          variant="text"
          onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
          sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '13px', minHeight: 36 }}
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
          // ボトムナビ分だけ上にシフト
          mt: { xs: -6, md: -14 },
          px: { xs: 2, md: 3 },
          pb: { xs: '80px', md: 0 },
          width: '100%',
        }}
      >
        <Box sx={{ mb: { xs: 3, md: 4 }, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Logo size="large" />
        </Box>

        {expImageSearch && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              mb: 2,
              '& .MuiTab-root': { textTransform: 'none', minHeight: 40, fontSize: '14px' },
              '& .MuiTabs-indicator': { borderRadius: '2px' },
            }}
          >
            <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label={t.search} />
            <Tab icon={<ImageSearchIcon fontSize="small" />} iconPosition="start" label={t.imageSearch} />
          </Tabs>
        )}

        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 600, md: 700 } }}>
          {activeTab === 0 || !expImageSearch ? (
            <SearchBox variant="home" />
          ) : (
            <ImageSearch />
          )}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Home;
