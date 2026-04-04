import React, { memo, useMemo } from 'react';
import { Paper, Box, Typography, styled, useTheme } from '@mui/material';
import {
  HomeOutlined as HomeIcon,
  SearchOutlined as SearchIcon,
  HistoryOutlined as HistoryIcon,
  SettingsOutlined as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';

const NAV_HEIGHT = 64;

const NavContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1200,
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(18,18,18,0.92)'
    : 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '20px 20px 0 0',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 -1px 0 rgba(255,255,255,0.08)'
    : '0 -1px 0 rgba(0,0,0,0.08)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
  padding: '0 8px',
  border: 'none',
}));

interface NavItemProps {
  active: boolean;
  activecolor: string;
  activebg: string;
}

const NavItemWrapper = styled(Box, {
  shouldForwardProp: (p) => !['active', 'activecolor', 'activebg'].includes(p as string),
})<NavItemProps>(({ active, activecolor, activebg }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, transform 0.15s ease',
  backgroundColor: active ? activebg : 'transparent',
  color: active ? activecolor : 'inherit',
  minWidth: 56,
  minHeight: 48,
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  '&:active': {
    transform: 'scale(0.88)',
    backgroundColor: activebg,
  },
}));

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, language } = useSearchStore();
  const t = translations[language];
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const navItems = useMemo(() => [
    {
      label: t.navHome,
      path: '/',
      icon: <HomeIcon sx={{ fontSize: 24 }} />,
      activecolor: isDark ? '#bb86fc' : '#6200ee',
      activebg: isDark ? 'rgba(187,134,252,0.15)' : 'rgba(98,0,238,0.08)',
    },
    {
      label: t.navSearch,
      path: '/search',
      icon: <SearchIcon sx={{ fontSize: 24 }} />,
      activecolor: isDark ? '#ff79c6' : '#e91e63',
      activebg: isDark ? 'rgba(255,121,198,0.15)' : 'rgba(233,30,99,0.08)',
    },
    {
      label: t.navHistory,
      path: '/history',
      icon: <HistoryIcon sx={{ fontSize: 24 }} />,
      activecolor: isDark ? '#03dac6' : '#009688',
      activebg: isDark ? 'rgba(3,218,198,0.15)' : 'rgba(0,150,136,0.08)',
    },
    {
      label: t.navSettings,
      path: '/settings',
      icon: <SettingsIcon sx={{ fontSize: 24 }} />,
      activecolor: isDark ? '#ffb86c' : '#f57c00',
      activebg: isDark ? 'rgba(255,184,108,0.15)' : 'rgba(245,124,0,0.08)',
    },
  ], [isDark, t]);

  const currentPath = location.pathname;

  const handleNavClick = (path: string) => {
    if (path === '/search' && !query) return;
    triggerHaptic();
    navigate(path);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      {/* ボトムナビの高さ分だけコンテンツが隠れないようスペーサー */}
      <Box sx={{ height: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))` }} />
      <NavContainer elevation={0}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const isDisabled = item.path === '/search' && !query;

          return (
            <NavItemWrapper
              key={item.path}
              active={isActive}
              activecolor={item.activecolor}
              activebg={item.activebg}
              onClick={() => handleNavClick(item.path)}
              sx={{
                opacity: isDisabled ? 0.4 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              <Box sx={{ color: isActive ? item.activecolor : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'), lineHeight: 0 }}>
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: isActive ? 700 : 400,
                  mt: '2px',
                  color: isActive ? item.activecolor : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'),
                  lineHeight: 1,
                  letterSpacing: '-0.2px',
                }}
              >
                {item.label}
              </Typography>
            </NavItemWrapper>
          );
        })}
      </NavContainer>
    </Box>
  );
};

export default memo(MobileBottomNav);
