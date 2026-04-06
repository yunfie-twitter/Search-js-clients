import { useEffect, useRef, useCallback } from 'react';

interface Options {
  onRefresh: () => void;
  threshold?: number;
  disabled?: boolean;
}

/**
 * Pull-to-Refresh hook.
 * - 全イベント passive:true — preventDefault 不使用なのでスクロールを完全に妨げない
 * - インジケーターの表示は純粋な視覚フィードバックのみ
 * - リフレッシュは scrollY === 0 のときに十分引っ張った場合のみ
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: Options) {
  const startY      = useRef(0);
  const pulling     = useRef(false);
  const triggered   = useRef(false);
  const indicator   = useRef<HTMLDivElement | null>(null);

  const setIndicator = useCallback((el: HTMLDivElement | null) => {
    indicator.current = el;
  }, []);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      // ページが一番上のときのみ pull 開始とみなす
      if (window.scrollY > 0) return;
      startY.current    = e.touches[0].clientY;
      pulling.current   = true;
      triggered.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      // スクロール中に引っ張った場合はキャンセル
      if (window.scrollY > 0) {
        pulling.current = false;
        hideIndicator();
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { hideIndicator(); return; }

      // スクロールを一切妨げない (passive:true なので preventDefault 不可)
      const progress   = Math.min(dy / threshold, 1);
      const translateY = Math.min(dy * 0.4, threshold * 0.55);
      if (indicator.current) {
        indicator.current.style.opacity   = String(progress);
        indicator.current.style.transform =
          `translateX(-50%) translateY(${translateY}px) rotate(${progress * 360}deg)`;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = e.changedTouches[0].clientY - startY.current;
      hideIndicator();
      if (dy >= threshold && !triggered.current && window.scrollY === 0) {
        triggered.current = true;
        onRefresh();
      }
    };

    const hideIndicator = () => {
      if (indicator.current) {
        indicator.current.style.opacity   = '0';
        indicator.current.style.transform = 'translateX(-50%)';
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onRefresh, threshold, disabled]);

  return { setIndicator };
}
