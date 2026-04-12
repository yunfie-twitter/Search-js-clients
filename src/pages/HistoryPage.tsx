import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
  ClearAll as ClearAllIcon,
  DeleteForeverOutlined as DeleteForeverIcon,
  DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHistory, removeHistory, clearHistory, HistoryEntry } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { BottomNavSpacer } from '../components/MobileBottomNav';

const ITEMS_PER_PAGE = 50;

import confetti from 'canvas-confetti';
import { playSonicSuccess } from '../utils/sonic';
// ... rest remains mostly same, find handleClearConfirmed
const HistoryHeatmap: React.FC<{ history: HistoryEntry[]; isDark: boolean }> = ({ history, isDark }) => {
  const language = useSearchStore((s) => s.language);
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      const d = new Date(h.time);
      // Adjust for local timezone to ensure correct date string
      const dateString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      counts[dateString] = (counts[dateString] || 0) + 1;
    });
    return counts;
  }, [history]);

  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    // 過去90日分 (approx 13 weeks)
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      result.push(dateString);
    }
    return result;
  }, []);

  const maxCount = Math.max(1, ...Object.values(data));

  const getColor = (count: number) => {
    if (count === 0) return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const intensity = Math.min(count / maxCount, 1);
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(10, 132, 255, ${alpha})`; // primary color roughly
  };

  return (
    <Box sx={{ mb: 4, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, ml: 1, fontWeight: 600 }}>
        {language === 'ja' ? '検索アクティビティ（過去90日）' : 'Search Activity (Last 90 days)'}
      </Typography>
      <Box sx={{ display: 'flex', gap: '4px', minWidth: 'min-content' }}>
        {days.reduce((weeks, day, i) => {
          const weekIdx = Math.floor(i / 7);
          if (!weeks[weekIdx]) weeks[weekIdx] = [];
          weeks[weekIdx].push(day);
          return weeks;
        }, [] as string[][]).map((week, wIdx) => (
          <Box key={wIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {week.map((day) => {
              const count = data[day] || 0;
              return (
                <Tooltip key={day} title={`${day}: ${count} searches`} arrow placement="top">
                  <Box
                    sx={{
                      width: 14, height: 14, borderRadius: '3px',
                      backgroundColor: getColor(count),
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.2)' }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems]       = useState<HistoryEntry[]>([]);
  const [visibleCount, setVisibleCount]       = useState(ITEMS_PER_PAGE);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  const navigate  = useNavigate();
  const language  = useSearchStore((s) => s.language);
  const expHistoryExport = useSearchStore((s) => s.expHistoryExport);
  const expHistoryHeatmap = useSearchStore((s) => s.expHistoryHeatmap);
  const themeMode = useSearchStore((s) => s.themeMode);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const t         = useMemo(() => translations[language], [language]);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const refreshHistory = useCallback(() => {
    setHistoryItems(getHistory());
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);
  
  useEffect(() => { refreshHistory(); }, [refreshHistory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, historyItems.length));
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [historyItems.length]);

  const handleDeleteItem     = (q: string, type: string) => { removeHistory(q, type); setHistoryItems(getHistory()); };
  const handleClearConfirmed = () => {
    const expMicroSparks = useSearchStore.getState().expMicroSparks;
    const expSonicUi = useSearchStore.getState().expSonicUi;

    if (expMicroSparks) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    if (expSonicUi) {
      playSonicSuccess();
    }
    
    clearHistory(); 
    refreshHistory(); 
    setShowClearDialog(false); 
  };

  const handleExport = (format: 'json' | 'csv') => {
    setExportMenuAnchor(null);
    let dataStr = '';
    let mimeType = '';
    if (format === 'json') {
      dataStr = JSON.stringify(historyItems, null, 2);
      mimeType = 'application/json';
    } else {
      dataStr = ['Query,Type,Time\n', ...historyItems.map(h => `"${h.q.replace(/"/g, '""')}","${h.type}",${new Date(h.time).toISOString()}`)].join('\n');
      mimeType = 'text/csv';
    }
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wholphin_history.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAction = historyItems.length > 0 ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {expHistoryExport && (
        <>
          <IconButton size="small" onClick={(e) => setExportMenuAnchor(e.currentTarget)}>
            <DownloadIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
            <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
          </Menu>
        </>
      )}
      <Button startIcon={<ClearAllIcon />} onClick={() => setShowClearDialog(true)} color="error" sx={{ textTransform: 'none', fontSize: '13px' }}>
        {t.clearHistory}
      </Button>
    </Box>
  ) : undefined;

  const visibleItems = useMemo(() => historyItems.slice(0, visibleCount), [historyItems, visibleCount]);

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
            <>
              {expHistoryHeatmap && <HistoryHeatmap history={historyItems} isDark={isDark} />}
              <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <List sx={{ py: 0 }}>
                  {visibleItems.map((item, index) => (
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
                      {index < visibleItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {visibleCount < historyItems.length && (
                  <Box ref={observerTarget} sx={{ height: 20 }} />
                )}
              </Paper>
            </>
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
