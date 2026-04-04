import React, { memo, useMemo } from 'react';
import { Paper, Box, Typography, styled, useTheme } from '@mui/material';
import { 
  HomeOutlined as HomeIcon, 
  SearchOutlined as SearchIcon, 
  HistoryOutlined as HistoryIcon,
  SettingsOutlined as SettingsIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';

const NavContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed', 
  bottom: 0, 
  left: 0, 
  right: 0, 
  zIndex: 1200,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '24px 24px 0 0',
  boxShadow: theme.palette.mode === 'dark' ? '0 -4px 16px rgba(0,0,0,0.4)' : '0 -4px 16px rgba(0,0,0,0.08)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: 70,
  padding: '0 16px',
}));

interface NavItemProps {
  active: boolean;
  color: string;
  bgColor: string;
}

const NavItemWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color' && prop !== 'bgColor',
})<NavItemProps>(({ active, color, bgColor, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: active ? '10px 20px' : '10px',
  borderRadius: '30px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
  backgroundColor: active ? bgColor : 'transparent',
  color: active ? color : theme.palette.text.secondary,
  minWidth: active ? '110px' : '44px',
  overflow: 'hidden',
  justifyContent: 'center',
  '&:active': {
    transform: 'scale(0.92)',
  },
  WebkitTapHighlightColor: 'transparent',
}));

const NavLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  marginLeft: active ? '8px' : '0px',
  width: active ? 'auto' : '0px',
  opacity: active ? 1 : 0,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  whiteSpace: 'nowrap',
}));

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { query } = useSearchStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const navItems = useMemo(() => [
    { label: 'Home', path: '/', icon: <HomeIcon />, color: isDark ? '#bb86fc' : '#6200ee', bgColor: isDark ? 'rgba(187, 134, 252, 0.15)' : '#f3e5f5' },
    { label: 'Search', path: '/search', icon: <SearchIcon />, color: isDark ? '#ff79c6' : '#e91e63', bgColor: isDark ? 'rgba(255, 121, 198, 0.15)' : '#fce4ec' },
    { label: 'History', path: '/history', icon: <HistoryIcon />, color: isDark ? '#03dac6' : '#009688', bgColor: isDark ? 'rgba(3, 218, 198, 0.15)' : '#e0f2f1' },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon />, color: isDark ? '#ffb86c' : '#ff9800', bgColor: isDark ? 'rgba(255, 184, 108, 0.15)' : '#fff3e0' },
  ], [isDark]);

  const currentPath = location.pathname;

  const handleNavClick = (path: string) => {
    if (path === '/search' && !query) return;
    navigate(path);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <NavContainer elevation={0}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/search' && currentPath === '/search');
          const isDisabled = item.path === '/search' && !query;

          return (
            <NavItemWrapper
              key={item.label}
              active={isActive}
              color={item.color}
              bgColor={item.bgColor}
              onClick={() => handleNavClick(item.path)}
              sx={{ 
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'default' : 'pointer'
              }}
            >
              {item.icon}
              <NavLabel active={isActive}>
                {item.label}
              </NavLabel>
            </NavItemWrapper>
          );
        })}
      </NavContainer>
    </Box>
  );
};

export default memo(MobileBottomNav);
