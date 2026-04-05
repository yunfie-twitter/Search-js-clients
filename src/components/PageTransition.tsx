/**
 * PageTransition — Apple spring.
 * タブ切り替え（t=パラメータ変化のみ）はアニメーションをスキップしパフォーマンスを改善する。
 * 画像/動画グリッドレイアウトの切り替えもスキップ（多数のimg要素のアニメーションが重いため）。
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';
import { EASE_SPRING, EASE_IN, DUR_PAGE } from '../utils/motion';

const OUT_MS = 90;
const IN_MS  = DUR_PAGE;

const GRID_TYPES = new Set(['image', 'video']);

const VARIANTS = {
  forwardOut: { x: '-10px', opacity: 0, scale: 0.99 },
  forwardIn:  { x:  '14px', opacity: 0, scale: 1.00 },
  backOut:    { x:  '10px', opacity: 0, scale: 0.99 },
  backIn:     { x: '-14px', opacity: 0, scale: 1.00 },
  idle:       { x:   '0px', opacity: 1, scale: 1.00 },
} as const;

type VKey = keyof typeof VARIANTS;

const toCss = (v: (typeof VARIANTS)[VKey]) => ({
  transform: `translateX(${v.x}) scale(${v.scale})`,
  opacity: v.opacity,
});

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navType  = useNavigationType();

  const prevKey    = useRef(location.key);
  const prevSearch = useRef(location.search);
  const [vkey, setVkey]   = useState<VKey>('idle');
  const [trans, setTrans] = useState('');
  const animating  = useRef(false);

  const animate = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    const isBack = navType === 'POP';

    setTrans(`transform ${OUT_MS}ms ${EASE_IN}, opacity ${OUT_MS}ms ${EASE_IN}`);
    setVkey(isBack ? 'backOut' : 'forwardOut');

    setTimeout(() => {
      setTrans('none');
      setVkey(isBack ? 'backIn' : 'forwardIn');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setTrans(`transform ${IN_MS}ms ${EASE_SPRING}, opacity ${IN_MS}ms ${EASE_SPRING}`);
        setVkey('idle');
        setTimeout(() => { animating.current = false; }, IN_MS);
      }));
    }, OUT_MS);
  }, [navType]);

  useEffect(() => {
    if (location.key === prevKey.current) return;
    prevKey.current = location.key;

    const prevParams = new URLSearchParams(prevSearch.current);
    const newParams  = new URLSearchParams(location.search);
    const prevT = prevParams.get('t') ?? 'web';
    const newT  = newParams.get('t')  ?? 'web';
    const prevQ = prevParams.get('q');
    const newQ  = newParams.get('q');
    prevSearch.current = location.search;

    // タブ切り替え（q共通、tのみ変化）はスキップ
    if (location.pathname === '/search' && prevQ === newQ && prevT !== newT) return;

    // グリッド↔リスト 切り替え（画像/動画 ↔ その他）はスキップ
    if (
      location.pathname === '/search' &&
      prevQ === newQ &&
      GRID_TYPES.has(prevT) !== GRID_TYPES.has(newT)
    ) return;

    animate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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
