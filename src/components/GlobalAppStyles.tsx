import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

const EASE_IN_OUT = 'cubic-bezier(0.45, 0, 0.55, 1)';

const GlobalAppStyles = () => {
  const enableAnimations = useSearchStore((s) => s.enableAnimations);
  const expHoverElevation = useSearchStore((s) => s.expHoverElevation);
  const expSpringCard = useSearchStore((s) => s.expSpringCard);
  const expLowEndMode = useSearchStore((s) => s.expLowEndMode);

  const styles = React.useMemo(() => ({
    '*': {
      WebkitTapHighlightColor: 'transparent',
      boxSizing: 'border-box',
      textRendering: expLowEndMode ? 'optimizeSpeed' : 'optimizeLegibility',
      WebkitFontSmoothing: expLowEndMode ? 'auto' : 'antialiased',
      ...(expLowEndMode ? {
        animation: 'none !important',
        transition: 'none !important',
        boxShadow: 'none !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important',
      } : !enableAnimations ? {
        transition: 'none !important',
        animation: 'none !important'
      } : {}),
    },

    'html, body': {
      overscrollBehavior: 'none',
      margin: 0,
      padding: 0,
      // ズームを禁止（ネイティブアプリ風）
      touchAction: 'manipulation',
      WebkitTextSizeAdjust: 'none',
      userSelect: 'none',
    },

    '#root': {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      contain: expLowEndMode ? 'layout' : 'none',
      // overflow は CssBaseline に任せるかデフォルトの挙動（bodyスクロール）に従う
    },

    // ─── 極限最適化: 静的クラス群 (sxオーバーヘッドの完全排除) ───
    
    // 汎用ボタン
    '.pm-btn-base': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: expLowEndMode ? '4px' : '12px',
      transition: expLowEndMode ? 'none' : `all ${DUR_FAST}ms ${EASE_SPRING}`,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      userSelect: 'none',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
      willChange: expLowEndMode ? 'auto' : 'transform, opacity',
    },

    // 検索結果カード (Web用)
    '.pm-result-item-root': {
      position: 'relative',
      marginBottom: '16px',
      overflow: 'hidden',
      borderRadius: '16px',
      contain: 'content', // 描画範囲を完全に限定
    },
    '.pm-result-card-inner': {
      padding: '16px 18px',
      borderRadius: '16px',
      backgroundColor: 'var(--mui-palette-background-paper)',
      border: '1px solid var(--mui-palette-divider)',
      transition: expLowEndMode ? 'none' : `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}, transform 200ms ease-out`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    },
    '.pm-result-card-inner:hover': {
      transform: expLowEndMode ? 'none' : 'translateY(-1px) translateZ(0)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
    },

    // メディアカード (画像・動画グリッド用)
    '.pm-media-card-root': {
      width: '100%',
      borderRadius: expLowEndMode ? '2px' : '8px',
      overflow: 'hidden',
      border: '1px solid var(--mui-palette-divider)',
      backgroundColor: 'var(--mui-palette-background-paper)',
      display: 'flex',
      flexDirection: 'column',
      transition: expLowEndMode ? 'none' : 'transform 180ms cubic-bezier(0.22,1,0.36,1)',
      WebkitTapHighlightColor: 'transparent',
      contain: 'layout paint',
      contentVisibility: 'auto',
      containIntrinsicSize: '200px 250px',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    },
    '.pm-media-card-root:active': { transform: expLowEndMode ? 'none' : 'scale(0.97) translateZ(0)' },

    '.pm-media-thumb-container': {
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      backgroundColor: 'var(--mui-palette-action-hover)',
      overflow: 'hidden',
      flexShrink: 0,
    },

    // スケルトン
    '.pm-skeleton': {
      backgroundColor: 'rgba(0,0,0,0.06)',
      backgroundImage: expLowEndMode ? 'none' : 'linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.10) 37%, rgba(0,0,0,0.05) 63%)',
      backgroundSize: '1200px 100%',
      animation: expLowEndMode ? 'none' : `pm-shimmer 1.4s ${EASE_IN_OUT} infinite`,
      borderRadius: expLowEndMode ? '2px' : '8px',
    },

    '@keyframes pm-shimmer': {
      '0%':   { backgroundPosition: '-600px 0' },
      '100%': { backgroundPosition:  '600px 0' },
    },

    '@keyframes pm-fade-up': {
      from: { opacity: 0, transform: 'translateY(10px) translateZ(0)' },
      to:   { opacity: 1, transform: 'translateY(0) translateZ(0)' },
    },
    '.pm-fade-up': {
      animation: expLowEndMode ? 'none' : `pm-fade-up ${DUR_NORMAL}ms ${EASE_SPRING} both`,
    },

    // ガラスエフェクト (通常モード時のみ)
    '.pm-glass': {
      backdropFilter: expLowEndMode ? 'none' : 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: expLowEndMode ? 'none' : 'blur(20px) saturate(180%)',
      backgroundColor: 'rgba(var(--paper-rgb), 0.7)',
    },

  }), [enableAnimations, expHoverElevation, expSpringCard, expLowEndMode]);

  return <MuiGlobalStyles styles={styles as any} />;
};

export default GlobalAppStyles;
