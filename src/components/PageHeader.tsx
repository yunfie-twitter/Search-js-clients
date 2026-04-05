import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { ArrowBackOutlined as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { triggerHaptic } from '../utils/haptics';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, action }) => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: isDark ? 'rgba(18,18,18,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        zIndex: 1100,
        paddingTop: 'env(safe-area-inset-top)',
        transition: `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
      }}
    >
      <Toolbar disableGutters sx={{ px: 1, minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        <IconButton
          className="pm-icon-btn"
          onClick={handleBack}
          sx={{
            transition: `transform ${DUR_FAST}ms ${EASE_SPRING}, opacity ${DUR_FAST}ms ${EASE_SPRING}`,
            '&:hover': { transform: 'scale(1.1)', opacity: 0.8 },
            '&:active': { transform: 'scale(0.88)', opacity: 0.6 },
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
