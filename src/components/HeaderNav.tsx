import React, { memo } from 'react';
import { Box, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import SearchBox from './SearchBox';
import Tabs from './Tabs';

// 共通の垂直基準線（オフセット）: 画面幅に応じて段階的に調整
export const VERTICAL_GUIDE_LINE = { 
  xs: 2, 
  sm: 3, 
  md: 6,      // 中画面では少し狭める
  lg: '180px' // 大画面で本来のデザイン
};

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'background.default', 
        zIndex: 1100,
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
        top: 0,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* 1. Header Part: Logo & SearchBox */}
      <Toolbar 
        disableGutters 
        sx={{ 
          py: 1, 
          px: VERTICAL_GUIDE_LINE, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        <Box sx={{ mr: 4, display: { xs: 'none', sm: 'block' } }} onClick={() => navigate('/')}>
          <Logo />
        </Box>
        <Box sx={{ flexGrow: 1, maxWidth: 750 }}>
          <SearchBox variant="header" />
        </Box>
      </Toolbar>

      {/* 2. Tabs Part: 固定位置を維持 */}
      <Box sx={{ px: VERTICAL_GUIDE_LINE, width: '100%' }}>
        <Tabs />
      </Box>
    </AppBar>
  );
};

export default memo(HeaderNav);
