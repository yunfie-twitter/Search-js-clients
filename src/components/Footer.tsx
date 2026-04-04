import React from 'react';
import { Box, Typography, Divider, Container, Link } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const Footer: React.FC = () => {
  const { language } = useSearchStore();
  const t = translations[language];

  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          {t.japan}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Link href="#" color="inherit" underline="hover">
            {t.about}
          </Link>
          <Link href="#" color="inherit" underline="hover">
            {t.advertising}
          </Link>
          <Link href="#" color="inherit" underline="hover">
            {t.business}
          </Link>
          <Link href="#" color="inherit" underline="hover" sx={{ ml: 'auto' }}>
            {t.privacy}
          </Link>
          <Link href="#" color="inherit" underline="hover">
            {t.terms}
          </Link>
          <Link href="#" color="inherit" underline="hover">
            {t.settings}
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
