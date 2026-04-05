import { useEffect, useRef, useCallback } from 'react';

interface Options {
  onRefresh: () => void;
  threshold?: number;   // px
  disabled?: boolean;
}

/**
 * Pull-to-Refresh hook.
 * コンテナ要素の ref を渡す。
 * 上端で引っ張ると onRefresh を呼ぶ。
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  disabled = false,
}: Options) {
  const startY    = useRef(0);
  const pulling   = useRef(false);
  const indicator = useRef<HTMLDivElement | null>(null);

  const setIndicator = useCallback((el: HTMLDivElement | null) => {
    indicator.current = el;
  }, []);

  useEffect(() => {
    if (disabled) return;
    const root = document.getElementById('root');
    if (!root) return;

    const onTouchStart = (e: TouchEvent) => {
      if (root.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return;
      const progress = Math.min(dy / threshold, 1);
      if (indicator.current) {
        indicator.current.style.transform = `translateY(${Math.min(dy * 0.4, threshold * 0.5)}px) rotate(${progress * 360}deg)`;
        indicator.current.style.opacity = String(progress);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (indicator.current) {
        indicator.current.style.transform = '';
        indicator.current.style.opacity = '0';
      }
      if (dy >= threshold) {
        onRefresh();
      }
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove',  onTouchMove,  { passive: true });
    root.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove',  onTouchMove);
      root.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onRefresh, threshold, disabled]);

  return { setIndicator };
}
