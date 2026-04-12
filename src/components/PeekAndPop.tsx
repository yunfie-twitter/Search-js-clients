import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Fade, Backdrop, Portal } from '@mui/material';
import { ResultMeta } from '@yunfie/search-js';
import { triggerHaptic } from '../utils/haptics';

interface PeekAndPopProps {
  item: ResultMeta | null;
  onClose: () => void;
  onConfirm?: (item: ResultMeta) => void;
}

const PeekAndPop: React.FC<PeekAndPopProps> = ({ item, onClose, onConfirm }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (item) {
      setActive(true);
      triggerHaptic(20); // Peek haptic
    } else {
      setActive(false);
    }
  }, [item]);

  if (!item) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handlePop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onConfirm) {
      triggerHaptic([10, 30]); // Pop haptic
      onConfirm(item);
    }
    onClose();
  };

  const originalThumbnail = (item as any).thumbnail;
  const proxyUrl = originalThumbnail
    ? `https://proxy.wholphin.net/image.webp?url=${encodeURIComponent(originalThumbnail)}`
    : null;

  return (
    <Portal>
      <Backdrop
        open={active}
        onClick={handleBackdropClick}
        sx={{
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Fade in={active} timeout={300}>
          <Box
            sx={{
              width: '90%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              userSelect: 'none',
            }}
          >
            <Paper
              elevation={24}
              onClick={handlePop}
              sx={{
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                transform: active ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                '&:active': { transform: 'scale(1.05)' },
              }}
            >
              {proxyUrl && (
                <Box
                  component="img"
                  src={proxyUrl}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/10',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}>
                  {(item as any).snippet || (item as any).description || item.url}
                </Typography>
              </Box>
            </Paper>

            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Tap to open • Release to cancel
            </Typography>
          </Box>
        </Fade>
      </Backdrop>
    </Portal>
  );
};

export default PeekAndPop;
