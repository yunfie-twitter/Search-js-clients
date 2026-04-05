/**
 * PageTransition — Premium Apple-style.
 * 各ページの「コンテンツ部分」のみを包む。AppBar / HeaderNav は対象外。
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';
import { EASE_SPRING, EASE_IN, DUR_PAGE } from '../utils/motion';

const OUT_MS = 100;
const IN_MS  = DUR_PAGE;

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

  const prevKey      = useRef(location.key);
  const [vkey, setVkey]   = useState<VKey>('idle');
  const [trans, setTrans] = useState('');
  const animating    = useRef(false);

  const animate = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    const isBack = navType === 'POP';

    // 1. Out
    setTrans(`transform ${OUT_MS}ms ${EASE_IN}, opacity ${OUT_MS}ms ${EASE_IN}`);
    setVkey(isBack ? 'backOut' : 'forwardOut');

    setTimeout(() => {
      // 2. Snap to in-start
      setTrans('none');
      setVkey(isBack ? 'backIn' : 'forwardIn');

      // 3. Spring in
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
