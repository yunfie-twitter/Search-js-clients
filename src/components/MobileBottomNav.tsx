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

export const BOTTOM_NAV_HEIGHT = 64;

// コンテンツがナビに隠れないように下に入れるスペーサー
export const BottomNavSpacer: React.FC = () => (
  <Box sx={{ display: { xs: 'block', md: 'none' }, height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }} />
);

const NavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1200,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 8,
  paddingRight: 8,
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(18,18,18,0.9)'
    : 'rgba(255,255,255,0.9)',
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
  transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
  backgroundColor: active ? bg : 'transparent',
  color: active ? color : 'inherit',
  minWidth: 44,
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  '&:active': { transform: 'scale(0.90)' },
}));

const MobileBottomNav = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { query, language } = useSearchStore();
  const t          = translations[language];
  const theme      = useTheme();
  const isDark     = theme.palette.mode === 'dark';

  const navItems = useMemo(() => [
    { label: t.navHome,     path: '/',        icon: HomeIcon,     color: isDark ? '#bb86fc' : '#6200ee', bg: isDark ? 'rgba(187,134,252,0.18)' : 'rgba(98,0,238,0.10)' },
    { label: t.navSearch,   path: '/search',  icon: SearchIcon,   color: isDark ? '#ff79c6' : '#e91e63', bg: isDark ? 'rgba(255,121,198,0.18)' : 'rgba(233,30,99,0.10)' },
    { label: t.navHistory,  path: '/history', icon: HistoryIcon,  color: isDark ? '#03dac6' : '#009688', bg: isDark ? 'rgba(3,218,198,0.18)'   : 'rgba(0,150,136,0.10)' },
    { label: t.navSettings, path: '/settings',icon: SettingsIcon, color: isDark ? '#ffb86c' : '#f57c00', bg: isDark ? 'rgba(255,184,108,0.18)' : 'rgba(245,124,0,0.10)' },
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
              sx={{ opacity: isDisabled ? 0.38 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
            >
              <Icon
                sx={{
                  fontSize: 22,
                  color: isActive ? color : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'),
                  transition: 'color 0.2s',
                  flexShrink: 0,
                }}
              />
              {isActive && (
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color,
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
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
