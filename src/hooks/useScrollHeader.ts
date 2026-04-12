import { useState, useEffect, useRef } from 'react';

/**
 * 高性能スクロールヘッダーフック。
 * 複数のスクロールコンテナ（root, search-scroll-container）を賢く検知し、
 * メインスレッドを占有しない軽量なイベント処理を行います。
 */
export const useScrollHeader = (enabled: boolean) => {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const lastDirection = useRef<'up' | 'down'>('up');

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      setScrolled(false);
      return;
    }

    // 動的に最適なスクロールコンテナを検知
    const findContainer = () => {
      return document.getElementById('search-scroll-container') || 
             document.getElementById('root') || 
             window;
    };

    let scrollTarget = findContainer();
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = (scrollTarget === window) 
        ? window.scrollY 
        : (scrollTarget as HTMLElement).scrollTop;

      setScrolled(currentScrollY > 20);

      if (currentScrollY > 80) {
        const delta = currentScrollY - lastScrollY.current;
        if (Math.abs(delta) > 5) {
          const direction = delta > 0 ? 'down' : 'up';
          if (direction !== lastDirection.current) {
            setHidden(direction === 'down');
            lastDirection.current = direction;
          }
        }
      } else {
        setHidden(false);
        lastDirection.current = 'up';
      }

      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // SPA遷移対策: コンテナが後から生成される場合があるため、再試行
    const retryTimer = setInterval(() => {
      const nextTarget = findContainer();
      if (nextTarget !== scrollTarget) {
        scrollTarget.removeEventListener('scroll', handleScroll);
        scrollTarget = nextTarget;
        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
      }
    }, 1000);

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(retryTimer);
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  return { hidden, scrolled };
};
