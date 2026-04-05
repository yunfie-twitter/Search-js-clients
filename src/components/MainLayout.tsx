import React from 'react';
import { Box } from '@mui/material';
import { VERTICAL_GUIDE_LINE } from './HeaderNav';

interface MainLayoutProps {
  children: React.ReactNode;
  isGridLayout: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, isGridLayout }) => {
  return (
    <Box
      component="main"
      className="scrollable-list"
      sx={{
        flexGrow: 1,
        pt: { xs: 2, md: 4 },
        pb: {
          xs: 'calc(80px + env(safe-area-inset-bottom))',
          md: 8,
        },
        // グリッド時は小さい固定px、リスト時は通常ガイドライン
        px: isGridLayout ? { xs: '8px', sm: '12px', md: '16px' } : VERTICAL_GUIDE_LINE,
        width: '100%',
        maxWidth: isGridLayout ? '100%' : '1400px',
        margin: isGridLayout ? 0 : '0 auto',
        // はみ出しを封じる
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
