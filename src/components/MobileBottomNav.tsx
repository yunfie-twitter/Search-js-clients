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
  // safe-area を内側余白に変換（10px 分浮かせる）
  paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
  paddingTop: '10px',
  paddingLeft: 8, paddingRight: 8,
  // ガラス風背景（少し濃いメールコート感）
  backgroundColor: isDark ? 'rgba(11,11,15,0.82)' : 'rgba(255,255,255,0.82)',
  backdropFilter: 'saturate(180%) blur(24px)',
  WebkitBackdropFilter: 'saturate(180%) blur(24px)',
  // 上側のみ薄い境界線
  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  boxShadow: isDark
    ? '0 -4px 24px rgba(0,0,0,0.32)'
    : '0 -4px 24px rgba(0,0,0,0.06)',
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
    { label: t.navHome,     path: '/',        Icon: HomeIcon    },
    { label: t.navHistory,  path: '/history', Icon: HistoryIcon },
    { label: t.navSettings, path: '/settings',Icon: SettingsIcon },
  ], [t]);

  const handleNav = (path: string) => { triggerHaptic(); navigate(path); };
  const handleFab = () => {
    triggerHaptic();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}&t=web`);
  };

  const activeColor   = isDark ? '#0a84ff' : '#007aff';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';

  const left  = SIDE_ITEMS.slice(0, 2);
  const right = SIDE_ITEMS.slice(2);

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <NavContainer isDark={isDark}>
        {/* 左 2 アイテム */}
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

        {/* 中央 FAB — シャドウをソフトに絞った */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Fab
            size="medium"
            onClick={handleFab}
            disabled={!query}
            sx={{
              backgroundColor: isDark ? '#0a84ff' : '#007aff',
              color: '#ffffff',
              // ソフトシャドウ + わずかな拡散光
              boxShadow: isDark
                ? '0 6px 20px rgba(59,130,246,0.28), 0 2px 6px rgba(0,0,0,0.3)'
                : '0 6px 20px rgba(59,130,246,0.20), 0 2px 6px rgba(0,0,0,0.08)',
              width: 52, height: 52,
              mb: `calc(${BOTTOM_NAV_HEIGHT * 0.18}px)`,
              transition: [
                `background-color ${DUR_FAST}ms ${EASE_SPRING}`,
                `box-shadow ${DUR_FAST}ms ${EASE_SPRING}`,
                `transform ${DUR_FAST}ms ${EASE_SPRING}`,
              ].join(', '),
              '&:hover': {
                backgroundColor: isDark ? '#409cff' : '#3395ff',
                boxShadow: isDark
                  ? '0 8px 28px rgba(59,130,246,0.36)'
                  : '0 8px 28px rgba(59,130,246,0.26)',
              },
              '&:active':   { transform: 'scale(0.91)' },
              '&:disabled': {
                backgroundColor: isDark ? '#3a3a3c' : '#c7c7cc',
                boxShadow: 'none',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 22 }} />
          </Fab>
        </Box>

        {/* 右 1 アイテム */}
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
