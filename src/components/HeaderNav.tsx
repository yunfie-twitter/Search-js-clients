import React, { memo } from 'react';
import { Box, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Logo from './Logo';
import SearchBox from './SearchBox';
import Tabs from './Tabs';

export const VERTICAL_GUIDE_LINE = {
  xs: 2,
  sm: 3,
  md: 6,
  lg: '180px',
};

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: isDark ? 'rgba(18,18,18,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 1100,
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
        top: 0,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          py: 1,
          px: VERTICAL_GUIDE_LINE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <Box sx={{ mr: 4, display: { xs: 'none', sm: 'block' }, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
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
