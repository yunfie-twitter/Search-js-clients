import React from 'react';
import { AppBar, Toolbar, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import SearchBox from './SearchBox';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        backgroundColor: '#ffffff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid #ebebeb',
        width: '100%'
      }}
    >
      <Toolbar 
        disableGutters 
        sx={{ 
          py: 1, 
          px: { xs: 2, md: '180px' }, // 左端の垂直基準線 (Logo/Input/Tabs/Results)
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-start' // 左寄せ
        }}
      >
        <Box sx={{ mr: 4, display: { xs: 'none', sm: 'block' } }} onClick={() => navigate('/')}>
          <Logo />
        </Box>
        <Box sx={{ flexGrow: 1, maxWidth: 750 }}>
          <SearchBox variant="header" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
