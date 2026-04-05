import { useEffect, useRef } from 'react';

interface Options {
  onNext: () => void;
  onPrev: () => void;
  threshold?: number;  // px
  disabled?: boolean;
}

/**
 * 左右スワイプでページ送り。
 * 左スワイプ = 次ページ、右スワイプ = 前ページ。
 * 上下方向优勢の場合は発火しない。
 */
export function useSwipePageNav({
  onNext, onPrev, threshold = 60, disabled = false,
}: Options) {
  const startX  = useRef(0);
  const startY  = useRef(0);
  const active  = useRef(false);

  useEffect(() => {
    if (disabled) return;
    const root = document.getElementById('root');
    if (!root) return;

    const onTouchStart = (e: TouchEvent) => {
      startX.current  = e.touches[0].clientX;
      startY.current  = e.touches[0].clientY;
      active.current  = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!active.current) return;
      active.current = false;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      // 小数点場所のスクロール待機と区別：横方向の成分が大きい時のみ発火
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.6) return;
      if (dx < 0) onNext(); else onPrev();
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onNext, onPrev, threshold, disabled]);
}
