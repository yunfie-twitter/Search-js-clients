import React from 'react';
import { Typography, Box, styled, useMediaQuery, useTheme } from '@mui/material';

const StyledLogo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  cursor: 'pointer',
  letterSpacing: '-0.5px',
  fontFamily: '"Merriweather Sans", sans-serif',
  fontOpticalSizing: 'auto',
  fontStyle: 'italic',
  flexShrink: 0,
  maxWidth: '100%',
  height: 'auto',
  transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Logo: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'small' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getFontSize = () => {
    if (size === 'large') {
      // モバイル: 3.5rem → 2.6rem、PC: 92px → 72px
      return isMobile ? '2.6rem' : '72px';
    }
    return isMobile ? '1.5rem' : '24px';
  };

  const getLetterSpacing = () => {
    if (size === 'large') {
      return isMobile ? '-1px' : '-2px';
    }
    return '-0.5px';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', maxWidth: '100%' }}>
      <StyledLogo
        sx={{
          fontSize: getFontSize(),
          letterSpacing: getLetterSpacing(),
        }}
      >
        wholphin
      </StyledLogo>
    </Box>
  );
};

export default Logo;
