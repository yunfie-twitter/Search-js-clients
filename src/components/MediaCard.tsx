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
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 180ms cubic-bezier(0.22,1,0.36,1)',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box',
        '@media (hover: hover)': {
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
        },
        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      {/* サムネイル: 4:3 に変更して縦幅を小さく */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 3',
        backgroundColor: 'action.hover',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
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
            position: 'absolute', bottom: 4, right: 4,
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: '#fff',
            px: '4px', py: '1px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 600,
            lineHeight: 1.4,
          }}>
            {(item as any).duration}
          </Box>
        )}
      </Box>

      {/* テキスト: コンパクトに */}
      <Box sx={{ p: '6px 8px 8px', minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: { xs: '11px', sm: '12px' },
            lineHeight: 1.35,
            mb: '2px',
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
            fontSize: { xs: '9px', sm: '10px' },
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
