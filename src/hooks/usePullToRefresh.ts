import { useEffect, useRef, useCallback } from 'react';

interface Options {
  onRefresh: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: Options) {
  const startY    = useRef(0);
  const pulling   = useRef(false);
  const triggered = useRef(false);
  const indicator = useRef<HTMLDivElement | null>(null);

  const setIndicator = useCallback((el: HTMLDivElement | null) => {
    indicator.current = el;
  }, []);

  useEffect(() => {
    if (disabled) return;
    const root = document.getElementById('root');
    if (!root) return;

    const onTouchStart = (e: TouchEvent) => {
      // scrollTop が 5px 以上なら絶対に開始しない
      if (root.scrollTop > 5) return;
      startY.current  = e.touches[0].clientY;
      pulling.current = true;
      triggered.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      // 最新の scrollTop も確認（高速スクロール後に引っ張った場合）
      if (root.scrollTop > 5) {
        pulling.current = false;
        if (indicator.current) {
          indicator.current.style.transform = 'translateX(-50%)';
          indicator.current.style.opacity   = '0';
        }
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return;

      // ブラウザ標準の overscroll を防ぐ
      e.preventDefault();

      const progress = Math.min(dy / threshold, 1);
      const translateY = Math.min(dy * 0.4, threshold * 0.55);
      if (indicator.current) {
        indicator.current.style.transform =
          `translateX(-50%) translateY(${translateY}px) rotate(${progress * 360}deg)`;
        indicator.current.style.opacity = String(progress);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (indicator.current) {
        indicator.current.style.transform = 'translateX(-50%)';
        indicator.current.style.opacity   = '0';
      }
      if (dy >= threshold && !triggered.current) {
        triggered.current = true;
        onRefresh();
      }
    };

    // touchmove は preventDefault() のため passive: false
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove',  onTouchMove,  { passive: false });
    root.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove',  onTouchMove);
      root.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onRefresh, threshold, disabled]);

  return { setIndicator };
}
