import React, { memo } from 'react';
import { Box, AppBar, Toolbar, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import SearchBox from './SearchBox';
import Tabs from './Tabs';
import { glass } from '../utils/glass';
import { EASE_SPRING, DUR_NORMAL } from '../utils/motion';

export const VERTICAL_GUIDE_LINE = { xs: 2, sm: 3, md: 6, lg: '180px' };

// body へのオーバースクロール抑制（ヘッダーが引っ張られないように）
if (typeof document !== 'undefined') {
  document.documentElement.style.overscrollBehaviorY = 'none';
}

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const g        = glass(isDark, 'light');

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        ...g,
        zIndex: 1100,
        top: 0,
        width: '100%',
        overscrollBehavior: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        // 白線を小さめに：透明度を下げる
        borderBottom: `1px solid ${
          isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
        }`,
        transition: `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
      }}
    >
      <Toolbar
        disableGutters
        sx={{ py: 1, px: VERTICAL_GUIDE_LINE, display: 'flex', alignItems: 'center' }}
      >
        <Box
          sx={{
            mr: 4,
            display: { xs: 'none', sm: 'block' },
            cursor: 'pointer',
            flexShrink: 0,
            transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}, transform ${DUR_NORMAL}ms ${EASE_SPRING}`,
            '&:hover':  { opacity: 0.72, transform: 'scale(0.97)' },
            '&:active': { opacity: 0.55, transform: 'scale(0.93)' },
          }}
          onClick={() => navigate('/')}
        >
          <Logo />
        </Box>
        <Box sx={{ flexGrow: 1, maxWidth: 750 }}>
          <SearchBox variant="header" />
        </Box>
      </Toolbar>
      <Box sx={{ px: VERTICAL_GUIDE_LINE, width: '100%' }}>
        <Tabs />
      </Box>
    </AppBar>
  );
};

export default memo(HeaderNav);
