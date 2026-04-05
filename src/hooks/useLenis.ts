/**
 * useLenis.ts
 * Lenis による慣性スクロールを #root 要素に適用する。
 * expLenis=false のときは即座に destroy して通常スクロールに戻す。
 *
 * 依存: lenis（npm install lenis）
 * 静的 import を避け dynamic import のみ使用して型エラーを回避する。
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
        // dynamic import — 静的に import しないので型エラーにならない
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await import(/* @vite-ignore */ 'lenis').catch(() => null);
        if (!mod) return;
        const Lenis = mod.default ?? mod.Lenis;
        if (!Lenis) return;

        const root = document.getElementById('root');
        if (!root) return;

        lenis = new Lenis({
          wrapper:         root,
          content:         root,
          duration:        1.1,
          easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel:     true,
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
