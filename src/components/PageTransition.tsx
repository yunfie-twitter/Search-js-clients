/**
 * PageTransition — コンテンツのみアニメーション。AppBar は対象外。
 * - PUSH : 右からスライドイン
 * - POP  : 左からスライドイン
 * 移動量・ scale は最小限に抑え、「占っている」感なくスルッと動く感覚。
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';

const OUT_MS     = 120;
const IN_MS      = 280;
const EASE_IN    = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

// 移動量を小さく、scale はほぼなし
const VARIANTS = {
  forwardOut: { x: '-12px', opacity: 0 },
  forwardIn:  { x:  '20px', opacity: 0 },
  backOut:    { x:  '12px', opacity: 0 },
  backIn:     { x: '-20px', opacity: 0 },
  idle:       { x:   '0px', opacity: 1 },
} as const;

type VKey = keyof typeof VARIANTS;

const toCss = (v: (typeof VARIANTS)[VKey]) => ({
  transform: `translateX(${v.x})`,
  opacity: v.opacity,
});

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location  = useLocation();
  const navType   = useNavigationType();

  const prevKey        = useRef(location.key);
  const [current, setCurrent]     = useState<React.ReactNode>(children);
  const pendingRef     = useRef<React.ReactNode>(children);
  const [vkey, setVkey]           = useState<VKey>('idle');
  const [trans, setTrans]         = useState('');
  const animating      = useRef(false);

  useEffect(() => { pendingRef.current = children; });

  const animate = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    const isBack = navType === 'POP';

    // 1. 現ページ out
    setTrans(`transform ${OUT_MS}ms ${EASE_IN}, opacity ${OUT_MS}ms ${EASE_IN}`);
    setVkey(isBack ? 'backOut' : 'forwardOut');

    setTimeout(() => {
      // 2. コンテンツ切り替え・初期値セット（transition なし）
      setTrans('none');
      setCurrent(pendingRef.current);
      setVkey(isBack ? 'backIn' : 'forwardIn');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        // 3. スプリングイン
        setTrans(`transform ${IN_MS}ms ${EASE_SPRING}, opacity ${IN_MS}ms ${EASE_SPRING}`);
        setVkey('idle');
        setTimeout(() => { animating.current = false; }, IN_MS);
      }));
    }, OUT_MS);
  }, [navType]);

  useEffect(() => {
    if (location.key === prevKey.current) return;
    prevKey.current = location.key;
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
