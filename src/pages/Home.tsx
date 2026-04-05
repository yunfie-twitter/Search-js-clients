import React, { useMemo } from 'react';
import { Box, Container, Button, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import {
  SearchOutlined      as SearchIcon,
  ImageSearchOutlined as ImageSearchIcon,
  SettingsOutlined    as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import SearchBox from '../components/SearchBox';
import ImageSearch from '../components/ImageSearch';
import Footer from '../components/Footer';
import { BottomNavSpacer } from '../components/MobileBottomNav';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';

const Home: React.FC = () => {
  const language       = useSearchStore((s) => s.language);
  const setLanguage    = useSearchStore((s) => s.setLanguage);
  const expImageSearch = useSearchStore((s) => s.expImageSearch);
  const t = useMemo(() => translations[language], [language]);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* 右上: 言語切替 + 設定ボタン */}
      <Box
        sx={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 8px)',
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          zIndex: 10,
        }}
      >
        <Button
          variant="text"
          onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
          sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '13px', minHeight: 36 }}
        >
          {language === 'ja' ? 'English' : '日本語'}
        </Button>
        <Tooltip title={t.settings} placement="bottom-end">
          <IconButton
            size="small"
            onClick={() => { triggerHaptic(); navigate('/settings'); }}
            sx={{
              borderRadius: '10px',
              color: 'text.secondary',
              transition: 'transform 120ms ease-out, opacity 120ms ease-out',
              '&:hover':  { opacity: 0.75 },
              '&:active': { transform: 'scale(0.88)' },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* メインコンテンツ */}
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
      <BottomNavSpacer />
    </Box>
  );
};

export default Home;
