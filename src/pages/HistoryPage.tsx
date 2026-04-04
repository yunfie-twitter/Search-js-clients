import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Button, 
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import { 
  History as HistoryIcon, 
  Delete as DeleteIcon, 
  ClearAll as ClearAllIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHistory, removeHistory, clearHistory, HistoryEntry } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();
  const { language } = useSearchStore();
  const t = translations[language];
  const theme = useTheme();

  const refreshHistory = useCallback(() => {
    setHistoryItems(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleDeleteItem = (q: string, type: string) => {
    removeHistory(q, type);
    refreshHistory();
  };

  const handleClearAll = () => {
    if (window.confirm(t.historyClearConfirm)) {
      clearHistory();
      refreshHistory();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {t.history}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          {historyItems.length > 0 && (
            <Button 
              startIcon={<ClearAllIcon />} 
              onClick={handleClearAll}
              color="error"
              sx={{ textTransform: 'none' }}
            >
              {t.clearHistory}
            </Button>
          )}
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4, flexGrow: 1 }}>
        {historyItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t.noHistory}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')} 
              sx={{ mt: 3, textTransform: 'none', borderRadius: '24px' }}
            >
              {t.backToHome}
            </Button>
          </Box>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
            <List sx={{ py: 0 }}>
              {historyItems.map((item, index) => (
                <React.Fragment key={`${item.q}-${item.time}-${index}`}>
                  <ListItem 
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDeleteItem(item.q, item.type)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => navigate(`/search?q=${encodeURIComponent(item.q)}&t=${item.type}`)}>
                      <ListItemIcon>
                        <HistoryIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.q} 
                        secondary={new Date(item.time).toLocaleString()}
                        primaryTypographyProps={{ fontWeight: 500, color: 'text.primary' }}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < historyItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default HistoryPage;
