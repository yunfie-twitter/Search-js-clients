import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { ArrowBackOutlined as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { triggerHaptic } from '../utils/haptics';

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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1100,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar disableGutters sx={{ px: 1, minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        {/* 戻るボタンとタイトルの間に余白 */}
        <Box sx={{ width: 4 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '17px', sm: '20px' } }}>
          {title}
        </Typography>
        {action && <Box sx={{ ml: 'auto', pr: 1 }}>{action}</Box>}
      </Toolbar>
    </AppBar>
  );
};

export default PageHeader;
