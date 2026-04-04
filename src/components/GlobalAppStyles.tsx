import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';

const GlobalAppStyles = () => {
  const { enableAnimations } = useSearchStore();

  return (
    <MuiGlobalStyles
      styles={{
        '*': {
          WebkitTapHighlightColor: 'transparent',
          boxSizing: 'border-box',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          ...(enableAnimations ? {} : { transition: 'none !important', animation: 'none !important' }),
        },
        '.scrollable-list': {
          overscrollBehaviorY: 'auto',
          WebkitOverflowScrolling: 'touch',
        },
        'input, textarea, [contenteditable="true"], .selectable': {
          userSelect: 'text !important',
          WebkitUserSelect: 'text !important',
        },
        '.selectable *': {
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
        '.page-enter': {
          opacity: 0,
          transform: 'translateX(30px)',
        },
        '.page-enter-active': {
          opacity: 1,
          transform: 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        },
        '.selectable a, .selectable p, .selectable span': {
          userSelect: 'text !important',
          WebkitUserSelect: 'text !important',
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowX: 'hidden',
        },
        'p, span, div, a': {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }
      }}
    />
  );
};

export default GlobalAppStyles;
