import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
  ClearAll as ClearAllIcon,
  DeleteForeverOutlined as DeleteForeverIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHistory, removeHistory, clearHistory, HistoryEntry } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { BottomNavSpacer } from '../components/MobileBottomNav';

const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems]       = useState<HistoryEntry[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const navigate  = useNavigate();
  const language  = useSearchStore((s) => s.language);
  const t         = useMemo(() => translations[language], [language]);

  const refreshHistory = useCallback(() => setHistoryItems(getHistory()), []);
  useEffect(() => { refreshHistory(); }, [refreshHistory]);

  const handleDeleteItem     = (q: string, type: string) => { removeHistory(q, type); refreshHistory(); };
  const handleClearConfirmed = () => { clearHistory(); refreshHistory(); setShowClearDialog(false); };

  const clearAction = historyItems.length > 0 ? (
    <Button startIcon={<ClearAllIcon />} onClick={() => setShowClearDialog(true)} color="error" sx={{ textTransform: 'none', fontSize: '13px' }}>
      {t.clearHistory}
    </Button>
  ) : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* PageHeader はアニメ外 */}
      <PageHeader title={t.history} action={clearAction} />

      <PageTransition>
        <Container maxWidth="sm" sx={{ py: 3, flexGrow: 1 }}>
          {historyItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">{t.noHistory}</Typography>
              <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 3, textTransform: 'none', borderRadius: '24px' }}>
                {t.backToHome}
              </Button>
            </Box>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
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
                        <ListItemIcon><HistoryIcon color="action" /></ListItemIcon>
                        <ListItemText
                          primary={item.q}
                          secondary={new Date(item.time).toLocaleString()}
                          primaryTypographyProps={{ fontWeight: 500 }}
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
        <BottomNavSpacer />
      </PageTransition>

      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)} PaperProps={{ sx: { borderRadius: '16px', mx: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteForeverIcon color="error" />
          {language === 'ja' ? '履歴を全て削除' : 'Clear All History'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px', lineHeight: 1.7 }}>{t.historyClearConfirm}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setShowClearDialog(false)} sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}>
            {language === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
          <Button onClick={handleClearConfirmed} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: '10px' }}>
            {language === 'ja' ? '全て削除する' : 'Clear All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPage;
