import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme } from '@mui/material';
import { ArrowBackOutlined as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../utils/haptics';
import { glass } from '../utils/glass';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, action }) => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const g        = glass(isDark, 'light');

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        ...g,
        zIndex: 1100,
        paddingTop: 'env(safe-area-inset-top)',
        borderBottom: '1px solid',
        transition: `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
      }}
    >
      <Toolbar disableGutters sx={{ px: 1, minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            borderRadius: '12px',
            transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
            '&:hover':  { transform: 'scale(1.08)', opacity: 0.8 },
            '&:active': { transform: 'scale(0.88)', opacity: 0.55 },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ width: 4 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            flex: 1,
            fontSize: { xs: '17px', sm: '20px' },
            letterSpacing: '-0.01em',
            transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
          }}
        >
          {title}
        </Typography>
        {action && <Box sx={{ ml: 'auto', pr: 1 }}>{action}</Box>}
      </Toolbar>
    </AppBar>
  );
};

export default PageHeader;
