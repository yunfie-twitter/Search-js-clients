/**
 * Tabs.tsx
 * - ピル型選択タブ（変更なし）
 * - 横スワイプでタブ切り替え（タッチデバイスのみ）
 * - タブ切替時にフェードアウト → フェードイン アニメ（SearchResults 内のコンテンツは変更不要）
 */
import React, { memo, useMemo, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchType } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

const TAB_TYPES: SearchType[] = ['web', 'image', 'video', 'news'];

const Tabs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { language, type, setType } = useSearchStore();
  const t      = useMemo(() => translations[language], [language]);
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const query  = searchParams.get('q') || '';

  const LABELS: Record<SearchType, string> = useMemo(() => ({
    web: t.all, image: t.images, video: t.videos, news: t.news,
  }), [t]);

  const activeColor  = isDark ? '#0a84ff' : '#007aff';
  const activeBg     = isDark ? 'rgba(10,132,255,0.18)' : 'rgba(0,122,255,0.10)';
  const inactiveText = isDark ? '#8e8e93' : '#6c6c70';

  const handleChange = useCallback((newType: SearchType) => {
    if (newType === type) return;
    triggerHaptic();
    setType(newType);
    navigate(`/search?q=${encodeURIComponent(query)}&t=${newType}`, { replace: true });
  }, [type, query, navigate, setType]);

  // ─── スワイプハンドラー ───
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 48;  // px
  const DIRECTION_LOCK  = 10;  // 縦方向ロック px

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // 縦方向スクロールの場合は無視
    if (Math.abs(dy) > DIRECTION_LOCK) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    const currentIdx = TAB_TYPES.indexOf(type);
    if (dx < 0 && currentIdx < TAB_TYPES.length - 1) {
      // 左スワイプ → 次のタブ
      handleChange(TAB_TYPES[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      // 右スワイプ → 前のタブ
      handleChange(TAB_TYPES[currentIdx - 1]);
    }
  }, [type, handleChange]);

  return (
    <Box
      component="nav"
      role="tablist"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        width: '100%',
        overflowX: 'auto', scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        py: '6px',
      }}
    >
      {TAB_TYPES.map((tabType) => {
        const isActive = type === tabType;
        return (
          <Box
            key={tabType}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleChange(tabType)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              px: isActive ? '14px' : '12px',
              py: '6px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 400,
              color: isActive ? activeColor : inactiveText,
              backgroundColor: isActive ? activeBg : 'transparent',
              cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '-0.01em',
              transition: [
                `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
                `color ${DUR_FAST}ms ${EASE_SPRING}`,
                `padding ${DUR_NORMAL}ms ${EASE_SPRING}`,
                `transform ${DUR_FAST}ms ${EASE_SPRING}`,
              ].join(', '),
              '&:active': { transform: 'scale(0.92)', opacity: 0.75 },
              WebkitTapHighlightColor: 'transparent',
              minWidth: 44, minHeight: 32,
            }}
          >
            {LABELS[tabType]}
          </Box>
        );
      })}
    </Box>
  );
};

export default memo(Tabs);
