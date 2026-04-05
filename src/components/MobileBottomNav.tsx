import React, { memo, useMemo } from 'react';
import { Box, Typography, styled, useTheme } from '@mui/material';
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
import { glass } from '../utils/glass';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

export const BOTTOM_NAV_HEIGHT = 64;

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
  paddingLeft: 8,
  paddingRight: 8,
  // glass ユーティリティの値を展開
  backgroundColor:      isDark ? 'rgba(18,18,20,0.82)' : 'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
  contain: 'paint',
}));

interface PillProps { active: boolean; activeColor: string; activeBg: string; }

const Pill = styled(Box, {
  shouldForwardProp: (p) => !['active','activeColor','activeBg'].includes(p as string),
})<PillProps>(({ active, activeColor, activeBg }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: active ? '10px 18px' : '10px 12px',
  borderRadius: 30,
  cursor: 'pointer',
  minWidth: 44,
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  willChange: 'transform',
  backgroundColor: active ? activeBg : 'transparent',
  color: active ? activeColor : 'inherit',
  transition: [
    `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
    `padding ${DUR_NORMAL}ms ${EASE_SPRING}`,
    `transform ${DUR_FAST}ms ${EASE_SPRING}`,
  ].join(', '),
  '&:active': { transform: 'scale(0.88)' },
}));

const MobileBottomNav: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { query, language } = useSearchStore();
  const t    = translations[language];
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const navItems = useMemo(() => [
    { label: t.navHome,     path: '/',         Icon: HomeIcon,     color: isDark ? '#0a84ff' : '#007aff', bg: isDark ? 'rgba(10,132,255,0.18)'  : 'rgba(0,122,255,0.10)'  },
    { label: t.navSearch,   path: '/search',   Icon: SearchIcon,   color: isDark ? '#30d158' : '#34c759', bg: isDark ? 'rgba(48,209,88,0.18)'   : 'rgba(52,199,89,0.10)'  },
    { label: t.navHistory,  path: '/history',  Icon: HistoryIcon,  color: isDark ? '#64d2ff' : '#32ade6', bg: isDark ? 'rgba(100,210,255,0.18)' : 'rgba(50,173,230,0.10)' },
    { label: t.navSettings, path: '/settings', Icon: SettingsIcon, color: isDark ? '#ffd60a' : '#ffcc00', bg: isDark ? 'rgba(255,214,10,0.18)'  : 'rgba(255,204,0,0.10)'  },
  ], [isDark, t]);

  const currentPath = location.pathname;

  const handleClick = (path: string) => {
    if (path === '/search' && !query) return;
    triggerHaptic();
    navigate(path);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <NavContainer isDark={isDark}>
        {navItems.map(({ label, path, Icon, color, bg }) => {
          const isActive   = currentPath === path;
          const isDisabled = path === '/search' && !query;
          return (
            <Pill
              key={path}
              active={isActive}
              activeColor={color}
              activeBg={bg}
              onClick={() => handleClick(path)}
              sx={{ opacity: isDisabled ? 0.3 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
            >
              <Icon
                sx={{
                  fontSize: 22,
                  flexShrink: 0,
                  color: isActive ? color : (isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.38)'),
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}, transform ${DUR_FAST}ms ${EASE_SPRING}`,
                }}
              />
              {isActive && (
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '-0.01em',
                  color,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                  animation: `pm-fade-up ${DUR_NORMAL}ms ${EASE_SPRING} both`,
                }}>
                  {label}
                </Typography>
              )}
            </Pill>
          );
        })}
      </NavContainer>
    </Box>
  );
};

export default memo(MobileBottomNav);
