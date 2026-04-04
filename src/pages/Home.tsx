import React from 'react';
import { Box, Container, Button } from '@mui/material';
import Logo from '../components/Logo';
import SearchBox from '../components/SearchBox';
import Footer from '../components/Footer';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const Home: React.FC = () => {
  const { language, setLanguage } = useSearchStore();
  const t = translations[language];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header for Language toggle */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="text" 
          onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
          sx={{ color: 'text.primary', textTransform: 'none' }}
        >
          {language === 'ja' ? 'English' : '日本語'}
        </Button>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="md" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: { xs: -4, md: -12 }, // Offset upwards slightly more on desktop
          px: 3,
          // モバイルでのボトムナビゲーション分の余白
          pb: { xs: '80px', md: 0 }
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Logo size="large" />
        </Box>
        <SearchBox variant="home" />
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
