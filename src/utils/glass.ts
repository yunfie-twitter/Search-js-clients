/**
 * glass.ts — Glassmorphism utility
 * 使用箇所を限定し、ブラー負荷を最小化する。
 *
 * ルール：
 *   'light'  → Header / BottomNav  — blur(20px) + 80% opacity
 *   'strong' → Modal / Sheet       — blur(40px) + 94% opacity
 *   'subtle' → Card hover          — blur(8px)  + 非常に薄い
 */
export const glass = (isDark: boolean, strength: 'subtle' | 'light' | 'strong' = 'light') => {
  const configs = {
    subtle: {
      bg:    isDark ? 'rgba(28,28,30,0.60)' : 'rgba(255,255,255,0.60)',
      blur:  'blur(8px)',
      border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    light: {
      bg:    isDark ? 'rgba(18,18,20,0.82)' : 'rgba(255,255,255,0.82)',
      blur:  'blur(20px)',
      border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    strong: {
      bg:    isDark ? 'rgba(28,28,30,0.94)' : 'rgba(255,255,255,0.94)',
      blur:  'blur(40px)',
      border: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
    },
  };

  const c = configs[strength];
  return {
    backgroundColor:      c.bg,
    backdropFilter:       c.blur,
    WebkitBackdropFilter: c.blur,
    borderColor:          c.border,
    // Compositor に闉じ込めてブラー負荷を他に影響させない
    contain: 'paint' as const,
    // will-change は blur と併用すると逆效果なので auto
    willChange: 'auto' as const,
  };
};
