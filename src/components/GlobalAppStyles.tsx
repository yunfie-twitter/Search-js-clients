import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

const EASE_IN_OUT = 'cubic-bezier(0.45, 0, 0.55, 1)';

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
        'p, span, div, a': { overflowWrap: 'anywhere', wordBreak: 'break-word' },

        // ─ iOS overscroll (rubber-band) 全面抑制 ─
        'html': {
          overscrollBehavior: 'none',
          // iOS Safari 向け: html 自体のバウンスを無効化
          height: '100%',
          overflow: 'hidden',
        },
        'body': {
          overscrollBehavior: 'none',
          // スクロールは body に一本化し、引っ張りを止める
          height: '100%',
          overflow: 'hidden',
          position: 'fixed',
          width: '100%',
          // iOS Safari でのバウンススクロールを防ぐ
          WebkitOverflowScrolling: 'auto',
          touchAction: 'pan-x pan-y',
        },
        '#root': {
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          // スクロール可能なのは #root のみ
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        },
        '.scrollable-list': {
          overscrollBehaviorY: 'auto',
          WebkitOverflowScrolling: 'touch',
        },

        // ─ Slim scrollbar ─
        '*::-webkit-scrollbar':       { width: '4px', height: '4px' },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(128,128,128,0.28)',
          borderRadius: '4px',
          '&:hover': { background: 'rgba(128,128,128,0.5)' },
        },

        // ─ Button / card micro-interactions ─
        '.pm-btn': {
          transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, box-shadow ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
          willChange: 'transform',
        },
        '.pm-btn:hover':   { transform: 'scale(1.02)' },
        '.pm-btn:active':  { transform: 'scale(0.95)', opacity: 0.82 },

        '.pm-card': {
          transition: `transform ${DUR_NORMAL}ms ${EASE_SPRING}, box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
          willChange: 'transform',
          transformOrigin: 'center center',
        },
        '@media (hover: hover)': {
          '.pm-card:hover': { transform: 'translateY(-3px) scale(1.01)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' },
        },
        '.pm-card:active': { transform: 'scale(0.97)' },

        '.pm-icon-btn': {
          transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
          willChange: 'transform',
        },
        '.pm-icon-btn:active': { transform: 'scale(0.88)', opacity: 0.65 },

        // ─ Shimmer skeleton ─
        '@keyframes pm-shimmer': {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition:  '600px 0' },
        },
        '.pm-skeleton': {
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.10) 37%, rgba(0,0,0,0.05) 63%)',
          backgroundSize: '1200px 100%',
          animation: `pm-shimmer 1.4s ${EASE_IN_OUT} infinite`,
          borderRadius: '8px',
        },

        // ─ Fade-up stagger ─
        '@keyframes pm-fade-up': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        '.pm-fade-up': {
          animation: `pm-fade-up ${DUR_NORMAL}ms ${EASE_SPRING} both`,
        },

        // ─ Cinematic modal ─
        '@keyframes pm-modal-in': {
          from: { opacity: 0, transform: 'scale(0.94) translateY(8px)' },
          to:   { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        '.pm-modal': { animation: `pm-modal-in 360ms ${EASE_SPRING} both` },

        // ─ Bottom sheet ─
        '@keyframes pm-sheet-in': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        '.pm-sheet': { animation: `pm-sheet-in 360ms ${EASE_SPRING} both` },

        // ─ Pulse ─
        '@keyframes pm-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.45 },
        },
        '.pm-pulse': { animation: `pm-pulse 1.6s ${EASE_IN_OUT} infinite` },

        // ─ prefers-reduced-motion — 低スペック端末の自動軽量化 ─
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration:       '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration:      '0.001ms !important',
          },
        },
      }}
    />
  );
};

export default GlobalAppStyles;
