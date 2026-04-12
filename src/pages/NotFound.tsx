import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../utils/haptics';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', 
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      textAlign: 'center',
      p: 3
    }}>
      <ErrorIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
      <Typography variant="h4" fontWeight={800} gutterBottom>404</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Page not found or restricted access.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => { triggerHaptic(); navigate('/'); }}
        sx={{ borderRadius: '12px', px: 4, textTransform: 'none' }}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
