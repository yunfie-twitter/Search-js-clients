/**
 * PageTransition — ページ遷移アニメーションラッパー
 * useLocation の key 変化でスライドイン。
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const DURATION = 200; // ms

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location   = useLocation();
  const prevKey    = useRef(location.key);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [displayed, setDisplayed] = useState<React.ReactNode>(children);
  const pendingChildren = useRef<React.ReactNode>(children);

  useEffect(() => {
    pendingChildren.current = children;
    if (location.key === prevKey.current) return;
    prevKey.current = location.key;

    // フェードアウト→内容切り替え→フェードイン
    setPhase('out');
    const t1 = setTimeout(() => {
      setDisplayed(pendingChildren.current);
      setPhase('in');
      const t2 = setTimeout(() => setPhase('idle'), DURATION);
      return () => clearTimeout(t2);
    }, DURATION);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const style: React.CSSProperties = {
    transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    opacity:   phase === 'out' ? 0 : 1,
    transform: phase === 'out' ? 'translateY(6px)' : phase === 'in' ? 'translateY(0px)' : 'none',
    willChange: 'opacity, transform',
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }} style={style}>
      {displayed}
    </Box>
  );
};

export default PageTransition;
