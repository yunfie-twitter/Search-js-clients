/**
 * PageTransition — Apple spring.
 * タブ切り替え（t=パラメータ変化のみ）はアニメーションをスキップしパフォーマンスを改善する。
 * 画像/動画グリッドレイアウトの切り替えもスキップ（多数のimg要素のアニメーションが重いため）。
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';
import { EASE_SPRING, EASE_IN, DUR_PAGE, DUR_FAST } from '../utils/motion';
import { useSearchStore } from '../store/useSearchStore';

const OUT_MS = 90;
const IN_MS  = DUR_PAGE;

const GRID_TYPES = new Set(['image', 'video']);

const VARIANTS = {
  forwardOut: { x: '-10px', opacity: 0, scale: 0.99 },
  forwardIn:  { x:  '14px', opacity: 0, scale: 1.00 },
  backOut:    { x:  '10px', opacity: 0, scale: 0.99 },
  backIn:     { x: '-14px', opacity: 0, scale: 1.00 },
  idle:       { x:   '0px', opacity: 1, scale: 1.00 },
  tabOut:     { x:   '0px', opacity: 0, scale: 0.98 },
  tabIn:      { x:   '0px', opacity: 0, scale: 0.98 },
  swipeBackOut: { x: '100%', opacity: 0, scale: 1 },
  swipeBackIn:  { x: '100%', opacity: 0, scale: 1 },
  settingsIn:   { x: '0px', opacity: 0, scale: 0.94 },
  settingsOut:  { x: '0px', opacity: 0, scale: 0.94 },
  labsIn:       { x: '0px', opacity: 0, scale: 0.98, y: '40px' },
  labsOut:      { x: '0px', opacity: 0, scale: 0.98, y: '40px' },
} as const;

type VKey = keyof typeof VARIANTS;

const toCss = (v: (typeof VARIANTS)[VKey] & { y?: string }) => ({
  transform: `translate3d(${v.x}, ${v.y || '0px'}, 0) scale(${v.scale})`,
  opacity: v.opacity,
});

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navType  = useNavigationType();
  const enableAnimations = useSearchStore(s => s.enableAnimations);
  const pageTransitionType = useSearchStore(s => s.pageTransitionType);
  const expSwipeBack = useSearchStore(s => s.expSwipeBack);

  const prevKey    = useRef(location.key);
  const prevSearch = useRef(location.search);
  const [vkey, setVkey]   = useState<VKey>('idle');
  const [trans, setTrans] = useState('');
  const animating  = useRef(false);

  const animate = useCallback((isTabSwitch = false, forcedInKey?: VKey, forcedOutKey?: VKey) => {
    if (animating.current || !enableAnimations || pageTransitionType === 'none') return;
    animating.current = true;
    const isBack = navType === 'POP';

    // 強制的にフェードのみにする条件（ユーザー設定または画像・動画グリッド）
    const forceFade = pageTransitionType === 'fade';

    if (isTabSwitch && !forcedInKey) {
       const TAB_OUT = 60;
       setTrans(`opacity ${TAB_OUT}ms ${EASE_IN}, transform ${TAB_OUT}ms ${EASE_IN}`);
       setVkey('tabOut');
       setTimeout(() => {
         setTrans('none');
         setVkey('tabIn');
         requestAnimationFrame(() => requestAnimationFrame(() => {
           setTrans(`opacity ${DUR_FAST}ms ${EASE_SPRING}, transform ${DUR_FAST}ms ${EASE_SPRING}`);
           setVkey('idle');
           setTimeout(() => { animating.current = false; }, DUR_FAST);
         }));
       }, TAB_OUT);
       return;
    }

    if (expSwipeBack && isBack && !forcedInKey) {
       setTrans(`transform ${OUT_MS}ms ${EASE_IN}, opacity ${OUT_MS}ms ${EASE_IN}`);
       setVkey('swipeBackOut');
       setTimeout(() => {
         setTrans('none');
         setVkey('backIn');
         requestAnimationFrame(() => requestAnimationFrame(() => {
           setTrans(`transform ${IN_MS}ms ${EASE_SPRING}, opacity ${IN_MS}ms ${EASE_SPRING}`);
           setVkey('idle');
           setTimeout(() => { animating.current = false; }, IN_MS);
         }));
       }, OUT_MS);
       return;
    }

    let outKey: VKey = forcedOutKey || (isBack ? 'backOut' : 'forwardOut');
    let inKey: VKey  = forcedInKey  || (isBack ? 'backIn' : 'forwardIn');

    if (forceFade) {
      outKey = 'tabOut';
      inKey = 'tabIn';
    }

    if (!forcedInKey && !forceFade) {
      if (location.pathname === '/settings') {
        inKey = 'settingsIn';
      } else if (location.pathname === '/labs') {
        inKey = 'labsIn';
      }
    }

    setTrans(`transform ${OUT_MS}ms ${EASE_IN}, opacity ${OUT_MS}ms ${EASE_IN}`);
    setVkey(outKey);

    // RAFを使用してブラウザの次のフレームで確実に切り替える
    const nextFrame = () => {
      setTimeout(() => {
        setTrans('none');
        setVkey(inKey);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setTrans(`transform ${IN_MS}ms ${EASE_SPRING}, opacity ${IN_MS}ms ${EASE_SPRING}`);
          setVkey('idle');
          // 完了通知もRAFで行う
          requestAnimationFrame(() => {
            setTimeout(() => { animating.current = false; }, IN_MS);
          });
        }));
      }, OUT_MS);
    };
    requestAnimationFrame(nextFrame);
    }, [navType, enableAnimations, pageTransitionType, expSwipeBack, location.pathname]);

  useEffect(() => {
    if (location.key === prevKey.current || !enableAnimations) {
       if (!enableAnimations) setVkey('idle');
       return;
    }
    const isBack = navType === 'POP';
    prevKey.current = location.key;

    const prevParams = new URLSearchParams(prevSearch.current);
    const newParams  = new URLSearchParams(location.search);
    const prevT = prevParams.get('t') ?? 'web';
    const newT  = newParams.get('t')  ?? 'web';
    const prevQ = prevParams.get('q');
    const newQ  = newParams.get('q');
    prevSearch.current = location.search;

    // タブ切り替え
    if (location.pathname === '/search' && prevQ === newQ && prevT !== newT) {
      // グリッドが絡む場合はさらに簡略化
      if (GRID_TYPES.has(prevT) || GRID_TYPES.has(newT)) {
        animate(true, 'tabIn', 'tabOut');
      } else {
        animate(true);
      }
      return;
    }

    // 画像・動画ページへの遷移・離脱は X軸移動を抑制して軽量化
    if (location.pathname === '/search' && GRID_TYPES.has(newT)) {
       animate(false, 'tabIn', isBack ? 'backOut' : 'forwardOut');
       return;
    }

    animate(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, enableAnimations, navType]);

  if (!enableAnimations) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', willChange: 'transform, opacity' }}
      style={{ transition: trans, ...toCss(VARIANTS[vkey]) }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
