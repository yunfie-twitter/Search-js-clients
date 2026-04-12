import { useState, useEffect, useRef } from 'react';

interface UseVirtualVisibilityOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

// グローバルなオブザーバーインスタンスを共有してリソースを節約
const observers = new Map<string, IntersectionObserver>();

/**
 * 共有オブザーバーを利用した、極限まで軽量な Visibility フック。
 * 要素ごとにオブザーバーを生成せず、シングルトンで管理することで
 * 大量（数千〜）の要素があってもパフォーマンスが低下しません。
 */
export function useVirtualVisibility<T extends HTMLElement>(
  options: UseVirtualVisibilityOptions = { rootMargin: '600px' }
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 印刷対応
    const handlePrint = () => {
      setIsVisible(true);
      setHasBeenVisible(true);
    };
    window.addEventListener('beforeprint', handlePrint);

    const margin = options.rootMargin || '600px';
    const key = `${margin}-${options.threshold || 0}`;
    
    let observer = observers.get(key);
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const callback = (entry.target as any)._visibilityCallback;
          if (callback) callback(entry);
        });
      }, options);
      observers.set(key, observer);
    }

    (el as any)._visibilityCallback = (entry: IntersectionObserverEntry) => {
      const intersecting = entry.isIntersecting;
      setIsVisible(intersecting);
      if (intersecting) setHasBeenVisible(true);
    };

    observer.observe(el);

    return () => {
      observer?.unobserve(el);
      window.removeEventListener('beforeprint', handlePrint);
    };
  }, [options.rootMargin, options.threshold]);

  return { ref, isVisible, hasBeenVisible };
}
