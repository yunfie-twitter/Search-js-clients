/**
 * useLenis.ts
 * Lenis による慣性スクロールを #root 要素に適用する。
 * expLenis=false のときは即座に destroy して通常スクロールに戻す。
 *
 * 依存: lenis（npm install lenis）
 * lenis が未インストールの場合は dynamic import が失敗するだけで
 * アプリはクラッシュしない（try/catch で吸収）。
 */
import { useEffect, useRef } from 'react';

export const useLenis = (enabled: boolean) => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    let raf: number;
    let lenis: any;

    const boot = async () => {
      try {
        // lenis はオプション依存 — TSC の TS2307 を抑制
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error: lenis may not be installed
        const { default: Lenis } = await import('lenis');
        const root = document.getElementById('root');
        if (!root) return;

        lenis = new Lenis({
          wrapper:   root,
          content:   root,
          duration:  1.1,
          easing:    (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.8,
        });

        lenisRef.current = lenis;

        const tick = (time: number) => {
          lenis.raf(time);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        // lenis 未インストール or import エラー — 無視
      }
    };

    boot();

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);
};
