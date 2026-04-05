/**
 * PageTransition — コンテンツエリアのみアニメーション。
 * AppBar / HeaderNav は对象外なので必ず Routes ではなく
 * 各ページの「コンテンツ部分」を包むように使用する。
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';

const OUT_MS      = 100;
const IN_MS       = 260;
const EASE_IN     = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

const VARIANTS = {
  forwardOut: { x: '-10px', opacity: 0 },
  forwardIn:  { x:  '16px', opacity: 0 },
  backOut:    { x:  '10px', opacity: 0 },
  backIn:     { x: '-16px', opacity: 0 },
  idle:       { x:   '0px', opacity: 1 },
} as const;

type VKey = keyof typeof VARIANTS;

const toCss = (v: (typeof VARIANTS)[VKey]) => ({
  transform: `translateX(${v.x})`,
  opacity: v.opacity,
});

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navType  = useNavigationType();

  const prevKey        = useRef(location.key);
  const [vkey, setVkey]     = useState<VKey>('idle');
  const [trans, setTrans]   = useState('');
  const animating      = useRef(false);

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
