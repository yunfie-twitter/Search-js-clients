import React, { memo, useMemo } from 'react';
import { Box, Typography, styled, useTheme } from '@mui/material';
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
import { EASE_SPRING, DUR_NORMAL, DUR_FAST } from '../utils/motion';

export const BOTTOM_NAV_HEIGHT = 64;

export const BottomNavSpacer: React.FC = () => (
  <Box sx={{ display: { xs: 'block', md: 'none' }, height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }} />
);

const NavContainer = styled(Box)(({ theme }) => ({
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
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(18,18,18,0.88)'
    : 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
}));

interface PillProps { active: boolean; color: string; bg: string; }

const Pill = styled(Box, {
  shouldForwardProp: (p) => !['active', 'color', 'bg'].includes(p as string),
})<PillProps>(({ active, color, bg }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: active ? '10px 20px' : '10px 14px',
  borderRadius: 30,
  cursor: 'pointer',
  // Premium spring transition
  transition: [
    `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
    `padding ${DUR_NORMAL}ms ${EASE_SPRING}`,
    `transform ${DUR_FAST}ms ${EASE_SPRING}`,
  ].join(', '),
  backgroundColor: active ? bg : 'transparent',
  color: active ? color : 'inherit',
  minWidth: 44,
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  willChange: 'transform',
  '&:active': {
    transform: 'scale(0.88)',
  },
}));

const MobileBottomNav = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { query, language } = useSearchStore();
  const t          = translations[language];
  const theme      = useTheme();
  const isDark     = theme.palette.mode === 'dark';

  const navItems = useMemo(() => [
    { label: t.navHome,     path: '/',         icon: HomeIcon,     color: isDark ? '#bb86fc' : '#6200ee', bg: isDark ? 'rgba(187,134,252,0.18)' : 'rgba(98,0,238,0.10)' },
    { label: t.navSearch,   path: '/search',   icon: SearchIcon,   color: isDark ? '#ff79c6' : '#e91e63', bg: isDark ? 'rgba(255,121,198,0.18)' : 'rgba(233,30,99,0.10)' },
    { label: t.navHistory,  path: '/history',  icon: HistoryIcon,  color: isDark ? '#03dac6' : '#009688', bg: isDark ? 'rgba(3,218,198,0.18)'   : 'rgba(0,150,136,0.10)' },
    { label: t.navSettings, path: '/settings', icon: SettingsIcon, color: isDark ? '#ffb86c' : '#f57c00', bg: isDark ? 'rgba(255,184,108,0.18)' : 'rgba(245,124,0,0.10)' },
  ], [isDark, t]);

  const currentPath = location.pathname;

  const handleClick = (path: string) => {
    if (path === '/search' && !query) return;
    triggerHaptic();
    navigate(path);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <NavContainer>
        {navItems.map(({ label, path, icon: Icon, color, bg }) => {
          const isActive   = currentPath === path;
          const isDisabled = path === '/search' && !query;
          return (
            <Pill
              key={path}
              active={isActive}
              color={color}
              bg={bg}
              onClick={() => handleClick(path)}
              sx={{
                opacity: isDisabled ? 0.35 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
                transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
              }}
            >
              <Icon
                sx={{
                  fontSize: 22,
                  color: isActive ? color : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.42)'),
                  transition: `color ${DUR_NORMAL}ms ${EASE_SPRING}, transform ${DUR_FAST}ms ${EASE_SPRING}`,
                  flexShrink: 0,
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                }}
              />
              {isActive && (
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '13px',
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
