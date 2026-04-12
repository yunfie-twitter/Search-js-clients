import React, { useState, useCallback, memo, useMemo } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { ResultMeta } from '@yunfie/search-js';
import { useLongPress } from '../hooks/useLongPress';
import { useSearchStore } from '../store/useSearchStore';
import { useVirtualVisibility } from '../hooks/useVirtualVisibility';

interface MediaCardProps {
  item: ResultMeta;
  onClick: (item: ResultMeta) => void;
  onPeek?: (item: ResultMeta) => void;
}

/**
 * 業界最高峰の最適化を施したメディアカード。
 * 1. 中央集権型オブザーバーによるリソース最小化
 * 2. 画面外コンポーネントのツリー除外（アダプティブ・レンダリング）
 * 3. 動的メモリ解放
 * 4. 徹底したメモ化
 */
const MediaCard: React.FC<MediaCardProps> = memo(({ item, onClick, onPeek }) => {
  // rootMarginを広めに（800px）設定し、画面に入る前にレンダリング準備を終える
  const { ref, isVisible, hasBeenVisible } = useVirtualVisibility<HTMLDivElement>({ rootMargin: '800px' });
  
  const originalThumbnail = (item as any).thumbnail;
  const proxyUrl = useMemo(() => {
    if (!originalThumbnail) return null;
    return `https://proxy.wholphin.net/image.webp?url=${encodeURIComponent(originalThumbnail)}`;
  }, [originalThumbnail]);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isVideo = 'duration' in item;

  const handleLoad  = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  const longPressHandlers = useLongPress({
    onLongPress: useCallback(() => {
      if (onPeek) onPeek(item);
    }, [onPeek, item]),
    onClick: useCallback(() => onClick(item), [onClick, item]),
    delay: onPeek ? 400 : 500
  });

  const expLowEndMode = useSearchStore((s) => s.expLowEndMode);

  // 画面外かつ一度も表示されていない場合は、最小限の空のBoxのみを返す（Reactの負荷をゼロに）
  if (!isVisible && !hasBeenVisible) {
    return (
      <Box 
        ref={ref} 
        sx={{ width: '100%', aspectRatio: '4/3', bgcolor: 'action.hover', borderRadius: '12px' }} 
      />
    );
  }

  return (
    <Box
      ref={ref}
      {...longPressHandlers}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: 'action.hover',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        willChange: isVisible ? 'transform, opacity' : 'auto',
        transform: 'translateZ(0)', 
        transition: expLowEndMode ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:active': { transform: expLowEndMode ? 'none' : 'scale(0.96)' },
        border: '1px solid',
        borderColor: 'divider',
        contain: 'strict',
      }}
    >
      {/* プレースホルダー */}
      {(!loaded || !isVisible) && !error && (
        <Skeleton 
          variant="rectangular" 
          width="100%" height="100%" 
          animation={expLowEndMode ? false : 'pulse'}
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} 
        />
      )}
      
      {isVisible && proxyUrl && !error && (
        <Box
          component="img"
          src={proxyUrl}
          alt={item.title}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: expLowEndMode ? 'none' : 'opacity 0.3s ease-in-out',
            display: 'block',
          }}
        />
      )}

      {isVideo && (item as any).duration && isVisible && (
        <Box sx={{
          position: 'absolute', bottom: 4, right: 4,
          backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff',
          px: '4px', py: '1px', borderRadius: '3px',
          fontSize: '10px', fontWeight: 600, zIndex: 3,
        }}>
          {(item as any).duration}
        </Box>
      )}

      {/* 情報オーバーレイ: 画面外ではツリーから除外 */}
      {isVisible && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            p: 1,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            color: '#fff',
            zIndex: 2,
            animation: 'pm-fade-in 0.2s ease',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
              fontWeight: 500, fontSize: '11px', lineHeight: 1.2,
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block', fontSize: '9px', opacity: 0.8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {(item as any).domain || item.url}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default MediaCard;
