import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  label?: string;   // 旧プロパティ名（下位互換）
  title?: string;   // Labs.tsx が使っている別名
  action?: React.ReactNode; // 右端に配置するウィジェット
}

const SectionHeader: React.FC<Props> = ({ label, title, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pt: 2.5, pb: 0.5 }}>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        fontSize: '12px',
        color: 'text.secondary',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {label ?? title}
    </Typography>
    {action && <Box>{action}</Box>}
  </Box>
);

export default SectionHeader;
