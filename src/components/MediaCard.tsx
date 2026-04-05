import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { ResultMeta } from '@yunfie/search-js';

interface MediaCardProps {
  item: ResultMeta;
  onClick: (item: ResultMeta) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const originalThumbnail = (item as any).thumbnail;
  const proxyUrl = originalThumbnail
    ? `https://proxy.wholphin.net/image.webp?url=${encodeURIComponent(originalThumbnail)}`
    : null;
  const [imgSrc, setImgSrc] = React.useState<string | null>(proxyUrl);
  const isVideo = 'duration' in item;

  const handleImageError = () => {
    if (imgSrc === proxyUrl && originalThumbnail) setImgSrc(originalThumbnail);
  };

  return (
    <Box
      onClick={() => onClick(item)}
      sx={{
        // グリッドセル内で必ず 100% 幅に収まる
        width: '100%',
        minWidth: 0,
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms',
        WebkitTapHighlightColor: 'transparent',
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      {/* サムネイル — 16:9 固定アスペクト比 */}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: 'action.hover', overflow: 'hidden', flexShrink: 0 }}>
        {imgSrc ? (
          <Box
            component="img"
            src={imgSrc}
            alt={item.title || ''}
            onError={handleImageError}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        )}
        {isVideo && (item as any).duration && (
          <Box sx={{
            position: 'absolute', bottom: 6, right: 6,
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: '#fff',
            px: '5px', py: '1px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            lineHeight: 1.4,
          }}>
            {(item as any).duration}
          </Box>
        )}
      </Box>

      {/* テキストエリア */}
      <Box sx={{ p: '8px 10px 10px', flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: { xs: '12px', sm: '13px' },
            lineHeight: 1.4,
            mb: '3px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            fontSize: { xs: '10px', sm: '11px' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {(item as any).domain || item.url}
        </Typography>
      </Box>
    </Box>
  );
};

export default MediaCard;
