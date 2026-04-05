import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL, DUR_PAGE } from '../utils/motion';

const GlobalAppStyles = () => {
  const { enableAnimations } = useSearchStore();

  return (
    <MuiGlobalStyles
      styles={{
        // ─ Reset & base ─
        '*': {
          WebkitTapHighlightColor: 'transparent',
          boxSizing: 'border-box',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          ...(enableAnimations ? {} : { transition: 'none !important', animation: 'none !important' }),
        },
        'input, textarea, [contenteditable="true"], .selectable': {
          userSelect: 'text !important',
          WebkitUserSelect: 'text !important',
        },
        '.selectable *, .selectable a, .selectable p, .selectable span': {
          userSelect: 'text !important',
          WebkitUserSelect: 'text !important',
        },
        'a, button, [role="button"], .clickable': {
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          outline: 'none',
          cursor: 'pointer',
          touchAction: 'manipulation',
        },
        'p, span, div, a': {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowX: 'hidden',
        },
        '.scrollable-list': {
          overscrollBehaviorY: 'auto',
          WebkitOverflowScrolling: 'touch',
        },

        // ─ Premium button micro-interactions ─
        '.pm-btn': {
          transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, box-shadow ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
          willChange: 'transform',
        },
        '.pm-btn:hover': {
          transform: 'scale(1.02)',
        },
        '.pm-btn:active': {
          transform: 'scale(0.95)',
          opacity: 0.85,
        },

        // ─ Card hover: soft lift + scale ─
        '.pm-card': {
          transition: `transform ${DUR_NORMAL}ms ${EASE_SPRING}, box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
          willChange: 'transform',
          transformOrigin: 'center center',
        },
        '@media (hover: hover)': {
          '.pm-card:hover': {
            transform: 'translateY(-3px) scale(1.01)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
        '.pm-card:active': {
          transform: 'scale(0.97)',
        },

        // ─ Tap ripple for list items ─
        '.pm-list-item': {
          transition: `background-color ${DUR_FAST}ms ${EASE_SPRING}`,
        },
        '.pm-list-item:active': {
          transform: 'scale(0.99)',
        },

        // ─ Icon press ─
        '.pm-icon-btn': {
          transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
          willChange: 'transform',
        },
        '.pm-icon-btn:active': {
          transform: 'scale(0.88)',
          opacity: 0.7,
        },

        // ─ Loading skeleton shimmer ─
        '@keyframes pm-shimmer': {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        '.pm-skeleton': {
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)',
          backgroundSize: '1200px 100%',
          animation: `pm-shimmer 1.4s ${EASE_IN_OUT} infinite`,
          borderRadius: '8px',
        },

        // ─ Fade-in stagger for lists ─
        '@keyframes pm-fade-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        '.pm-fade-up': {
          animation: `pm-fade-up ${DUR_NORMAL}ms ${EASE_SPRING} both`,
        },

        // ─ Page transition classes ─
        '.pm-page-enter': {
          opacity: 0,
          transform: 'translateX(16px)',
        },
        '.pm-page-enter-active': {
          opacity: 1,
          transform: 'translateX(0)',
          transition: `opacity ${DUR_PAGE}ms ${EASE_OUT}, transform ${DUR_PAGE}ms ${EASE_SPRING}`,
        },

        // ─ Modal cinematic entry ─
        '@keyframes pm-modal-in': {
          from: { opacity: 0, transform: 'scale(0.94) translateY(8px)' },
          to:   { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        '.pm-modal': {
          animation: `pm-modal-in 360ms ${EASE_SPRING} both`,
        },

        // ─ Soft pulse (e.g. loading indicator) ─
        '@keyframes pm-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.45 },
        },
        '.pm-pulse': {
          animation: `pm-pulse 1.6s ${EASE_IN_OUT} infinite`,
        },

        // ─ Bottom sheet slide up ─
        '@keyframes pm-sheet-in': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        '.pm-sheet': {
          animation: `pm-sheet-in 360ms ${EASE_SPRING} both`,
        },
      }}
    />
  );
};

const EASE_IN_OUT = 'cubic-bezier(0.45, 0, 0.55, 1)';
export default GlobalAppStyles;
