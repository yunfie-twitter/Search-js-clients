import React, { memo, useMemo } from 'react';
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
  const t     = useMemo(() => translations[language], [language]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const query = searchParams.get('q') || '';

  const LABELS: Record<SearchType, string> = useMemo(() => ({
    web:   t.all,
    image: t.images,
    video: t.videos,
    news:  t.news,
  }), [t]);

  const handleChange = (newValue: SearchType) => {
    if (newValue === type) return;       // 同じタブは何もしない
    triggerHaptic();
    setType(newValue);
    navigate(`/search?q=${encodeURIComponent(query)}&t=${newValue}`, { replace: true });
  };

  return (
    <Box
      component="nav"
      role="tablist"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: { xs: '2px', sm: '4px' },
        width: '100%',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        pb: '1px',
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
              position: 'relative',
              px: { xs: '14px', sm: '16px' },
              py: '10px',
              pb: '12px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? (isDark ? '#0a84ff' : '#007aff')
                : (isDark ? '#8e8e93' : '#6c6c70'),
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '-0.01em',
              // シンプルな color + font-weight のみアニメ— GPU 負荷ゼロ
              transition: [
                `color ${DUR_FAST}ms ${EASE_SPRING}`,
                `font-weight 0ms`,
                `opacity ${DUR_FAST}ms ${EASE_SPRING}`,
              ].join(', '),
              // タップ フィードバック
              '&:active': { opacity: 0.65 },
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {LABELS[tabType]}

            {/* アクティブインジケーターバー */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: isActive ? '14px' : '50%',
                right: isActive ? '14px' : '50%',
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: isDark ? '#0a84ff' : '#007aff',
                opacity: isActive ? 1 : 0,
                transition: [
                  `left ${DUR_NORMAL}ms ${EASE_SPRING}`,
                  `right ${DUR_NORMAL}ms ${EASE_SPRING}`,
                  `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
                ].join(', '),
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default memo(Tabs);
