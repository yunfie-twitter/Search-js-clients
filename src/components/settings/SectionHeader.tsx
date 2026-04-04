import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ px: 2, pt: 3, pb: 1 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '11px' }}
    >
      {label}
    </Typography>
  </Box>
);

export default SectionHeader;
