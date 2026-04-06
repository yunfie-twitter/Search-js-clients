import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import { RefreshOutlined as RefreshIcon } from '@mui/icons-material';

/**
 * Pull-to-Refresh インジケーター。
 * 左右中央: left:50% + translateX(-50%)
 * JS 側の transform 設定にも translateX(-50%) を必ず含める。
 */
const PullToRefreshIndicator = forwardRef<HTMLDivElement>((_, ref) => (
  <Box
    ref={ref}
    sx={{
      position: 'fixed',
      top: 'calc(env(safe-area-inset-top) + 12px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      opacity: 0,
      transition: 'opacity 0.15s',
      pointerEvents: 'none',
      bgcolor: 'background.paper',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 3,
    }}
  >
    <RefreshIcon sx={{ fontSize: 22, color: 'primary.main' }} />
  </Box>
));

PullToRefreshIndicator.displayName = 'PullToRefreshIndicator';
export default PullToRefreshIndicator;
