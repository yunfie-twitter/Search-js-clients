import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { ResultMeta } from '@yunfie/search-js';

interface MediaCardProps {
  item: ResultMeta;
  onClick: (item: ResultMeta) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const originalThumbnail = (item as any).thumbnail;
  const proxyUrl = originalThumbnail ? `https://proxy.wholphin.net/image.webp?url=${encodeURIComponent(originalThumbnail)}` : null;
  const [imgSrc, setImgSrc] = React.useState<string | null>(proxyUrl);
  const isVideo = 'duration' in item;

  const handleImageError = () => {
    // プロキシでエラーが起きたらオリジナルのURLにフォールバック
    if (imgSrc === proxyUrl && originalThumbnail) {
      setImgSrc(originalThumbnail);
    }
  };

  return (
    <Card 
      onClick={() => onClick(item)}
      className="clickable"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        cursor: 'pointer',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        backgroundColor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        '&:active': {
          transform: 'scale(0.97)',
        },
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
        {imgSrc ? (
          <CardMedia
            component="img"
            image={imgSrc}
            alt={item.title}
            onError={handleImageError}
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton variant="rectangular" width="100%" height="100%" animation={false} />
          </Box>
        )}
        {isVideo && (item as any).duration && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 8, 
            right: 8, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            px: 0.5, 
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            {(item as any).duration}
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500, 
            lineHeight: 1.4,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.8em' // Fixed height for 2 lines
          }}
        >
          {item.title}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            display: 'block', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}
        >
          {(item as any).domain || item.url}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
