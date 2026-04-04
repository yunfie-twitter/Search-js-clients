/**
 * PageTransition — Apple HIG inspired
 *
 * ナビゲーション方向を史履スタックで判定し、
 * 「forward = 右からスライドイ
 * 「back    = 左からスライドイン
 * + 層次感を出すため scale を組み合わせる
 *
 * イイジョイン : 小さく translateX + scaleDown
 * アウト     : コンテンツ絶対位置固定、小さくフェード+移動
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Box } from '@mui/material';

// ---------- タイミング定数 ----------
const SLIDE_OUT_MS  = 160;   // 現ページが去る時間
const SLIDE_IN_MS   = 380;   // 次ページが入る時間—スプリング感を持たせる
const EASE_IN        = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_SPRING    = 'cubic-bezier(0.16, 1, 0.3, 1)';  // Expo ease-out ≈ iOS spring

// ---------- 方向別の初期 / 終了値 ----------
const variants = {
  forwardOut:  { x: '-30%',  scale: 0.94, opacity: 0 },
  forwardIn:   { x:  '60%',  scale: 1.00, opacity: 0 },
  backOut:     { x:  '40%',  scale: 0.94, opacity: 0 },
  backIn:      { x: '-60%',  scale: 1.00, opacity: 0 },
  idle:        { x:   '0%',  scale: 1.00, opacity: 1 },
} as const;

type Variant = keyof typeof variants;

function toCSS(v: (typeof variants)[Variant]) {
  return {
    transform: `translateX(${v.x}) scale(${v.scale})`,
    opacity: v.opacity,
  };
}

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location   = useLocation();
  const navType    = useNavigationType(); // POP = 戻る, PUSH = 進む

  const prevKey            = useRef(location.key);
  const [current, setCurrent]   = useState<React.ReactNode>(children);
  const pendingRef         = useRef<React.ReactNode>(children);
  const [variant, setVariant]   = useState<Variant>('idle');
  const [transition, setTransition] = useState('');
  const animating          = useRef(false);

  // children が変わったらペンディングに保持
  useEffect(() => { pendingRef.current = children; });

  const animate = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const isBack = navType === 'POP';
    const outVariant: Variant = isBack ? 'backOut'  : 'forwardOut';
    const inVariant:  Variant = isBack ? 'backIn'   : 'forwardIn';

    // 1️⃣ 現ページを小さくフェードアウト
    setTransition(`transform ${SLIDE_OUT_MS}ms ${EASE_IN}, opacity ${SLIDE_OUT_MS}ms ${EASE_IN}`);
    setVariant(outVariant);

    setTimeout(() => {
      // 2️⃣ コンテンツ切り替え + 入る側の初期状態をセット（トランジションなし）
      setTransition('none');
      setCurrent(pendingRef.current);
      setVariant(inVariant);

      // 3️⃣ 1フレーム待ってからスプリングイン
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransition(`transform ${SLIDE_IN_MS}ms ${EASE_SPRING}, opacity ${SLIDE_IN_MS}ms ${EASE_SPRING}`);
          setVariant('idle');

          setTimeout(() => {
            animating.current = false;
          }, SLIDE_IN_MS);
        });
      });
    }, SLIDE_OUT_MS);
  }, [navType]);

  useEffect(() => {
    if (location.key === prevKey.current) return;
    prevKey.current = location.key;
    animate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const css = toCSS(variants[variant]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        // コンテナからハミ出ないよう
        overflow: 'hidden',
        // GPU レイヤー化
        willChange: 'transform, opacity',
        // テキスト選択をブロック（アニメ中にウィンドウのテキスト選択が起きるのを防ぐ）
        userSelect: animating.current ? 'none' : 'auto',
      }}
      style={{
        transition,
        ...css,
      }}
    >
      {current}
    </Box>
  );
};

export default PageTransition;
