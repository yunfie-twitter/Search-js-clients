import React, { memo, useMemo } from 'react';
import { Box, Typography, Fab, styled, useTheme } from '@mui/material';
import {
  HomeOutlined     as HomeIcon,
  SearchOutlined   as SearchIcon,
  HistoryOutlined  as HistoryIcon,
  SettingsOutlined as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

export const BOTTOM_NAV_HEIGHT = 68;

export const BottomNavSpacer: React.FC = () => (
  <Box sx={{ display: { xs: 'block', md: 'none' }, height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }} />
);

const NavContainer = styled(Box, { shouldForwardProp: (p) => p !== 'isDark' })<{ isDark: boolean }>(({ isDark }) => ({
  position: 'fixed',
  bottom: 0, left: 0, right: 0,
  zIndex: 1200,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 8, paddingRight: 8,
  backgroundColor: isDark ? 'rgba(11,11,15,0.88)' : 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  contain: 'paint',
}));

const NavItem = styled(Box)({
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 2, flex: 1,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  py: '8px',
  minWidth: 44, minHeight: 44,
  transition: `transform ${DUR_FAST}ms ${EASE_SPRING}`,
  '&:active': { transform: 'scale(0.88)' },
});

const MobileBottomNav: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { query, language } = useSearchStore();
  const t     = translations[language];
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const SIDE_ITEMS = useMemo(() => [
    { label: t.navHome,     path: '/',        Icon: HomeIcon,     alwaysOn: true  },
    { label: t.navHistory,  path: '/history', Icon: HistoryIcon,  alwaysOn: true  },
    { label: t.navSettings, path: '/settings',Icon: SettingsIcon, alwaysOn: true  },
  ], [t]);

  const handleNav = (path: string) => {
    triggerHaptic();
    navigate(path);
  };

  const handleFab = () => {
    triggerHaptic();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}&t=web`);
  };

  const activeColor  = isDark ? '#0a84ff' : '#007aff';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';

  // 4アイテム: 左2 + 中央FAB + 右1
  const left  = SIDE_ITEMS.slice(0, 2);
  const right = SIDE_ITEMS.slice(2);

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <NavContainer isDark={isDark}>
        {/* 左2アイテム */}
        {left.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavItem key={path} onClick={() => handleNav(path)} sx={{ flex: 1 }}>
              <Icon sx={{
                fontSize: 24,
                color: isActive ? activeColor : inactiveColor,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}, transform ${DUR_FAST}ms ${EASE_SPRING}`,
              }} />
              <Typography sx={{
                fontSize: '10px', fontWeight: isActive ? 700 : 400,
                color: isActive ? activeColor : inactiveColor,
                letterSpacing: '-0.01em', lineHeight: 1,
                transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}`,
              }}>
                {label}
              </Typography>
            </NavItem>
          );
        })}

        {/* 中央 FAB */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Fab
            size="medium"
            onClick={handleFab}
            disabled={!query}
            sx={{
              backgroundColor: isDark ? '#0a84ff' : '#007aff',
              color: '#ffffff',
              boxShadow: isDark
                ? '0 4px 16px rgba(10,132,255,0.45), 0 1px 4px rgba(0,0,0,0.4)'
                : '0 4px 16px rgba(0,122,255,0.35), 0 1px 4px rgba(0,0,0,0.12)',
              width: 52, height: 52,
              // 少し浮かせる
              mb: `calc(${BOTTOM_NAV_HEIGHT * 0.18}px)`,
              transition: [
                `background-color ${DUR_FAST}ms ${EASE_SPRING}`,
                `box-shadow ${DUR_FAST}ms ${EASE_SPRING}`,
                `transform ${DUR_FAST}ms ${EASE_SPRING}`,
              ].join(', '),
              '&:hover': {
                backgroundColor: isDark ? '#409cff' : '#3395ff',
                boxShadow: isDark
                  ? '0 6px 24px rgba(10,132,255,0.55)'
                  : '0 6px 24px rgba(0,122,255,0.45)',
              },
              '&:active':   { transform: 'scale(0.91)' },
              '&:disabled': { backgroundColor: isDark ? '#3a3a3c' : '#c7c7cc', boxShadow: 'none' },
            }}
          >
            <SearchIcon sx={{ fontSize: 22 }} />
          </Fab>
        </Box>

        {/* 右1アイテム */}
        {right.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavItem key={path} onClick={() => handleNav(path)} sx={{ flex: 1 }}>
              <Icon sx={{
                fontSize: 24,
                color: isActive ? activeColor : inactiveColor,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}, transform ${DUR_FAST}ms ${EASE_SPRING}`,
              }} />
              <Typography sx={{
                fontSize: '10px', fontWeight: isActive ? 700 : 400,
                color: isActive ? activeColor : inactiveColor,
                letterSpacing: '-0.01em', lineHeight: 1,
                transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}`,
              }}>
                {label}
              </Typography>
            </NavItem>
          );
        })}
      </NavContainer>
    </Box>
  );
};

export default memo(MobileBottomNav);
