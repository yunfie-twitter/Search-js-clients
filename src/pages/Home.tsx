import { useMemo, useState, useEffect, useCallback, Suspense, FC, lazy } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Container, Button, Tabs, Tab, IconButton, Tooltip, Paper, Typography, CircularProgress, Skeleton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Checkbox, DialogActions, Badge } from '@mui/material';
import {
  SearchOutlined      as SearchIcon,
  ImageSearchOutlined as ImageSearchIcon,
  SettingsOutlined    as SettingsIcon,
  AutoAwesomeOutlined as AiIcon,
  EditOutlined        as EditIcon,
  DragHandleOutlined  as DragHandleIcon,
  NotificationsNoneOutlined as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '@yunfie/search-js';
import { generateGeminiContent } from '../utils/gemini';
import Logo from '../components/Logo';
import SearchBox from '../components/SearchBox';
import ImageSearch from '../components/ImageSearch';
import Footer from '../components/Footer';
import { BottomNavSpacer } from '../components/MobileBottomNav';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import { cardRegistry } from '../components/homeCards/registry';
import { useLongPress } from '../hooks/useLongPress';

const InitialSetupDialog = lazy(() => import('../components/InitialSetupDialog'));
const NotificationDialog = lazy(() => import('../components/NotificationDialog'));

// PWA 判定
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');
};

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simple DnD mock using state for the edit dialog
const WidgetEditDialog: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { language, activeCards, setActiveCards, thirdPartyWidgets } = useSearchStore(
    useShallow((s) => ({
      language: s.language,
      activeCards: s.activeHomeCards,
      setActiveCards: s.setActiveHomeCards,
      thirdPartyWidgets: s.thirdPartyWidgets,
    }))
  );
  
  const [localActive, setLocalActive] = useState<string[]>([]);
  const allCardIds = useMemo(() => [
    ...Object.keys(cardRegistry),
    ...thirdPartyWidgets.map(w => w.id)
  ], [thirdPartyWidgets]);

  useEffect(() => {
    if (open) {
      setLocalActive([...activeCards]);
    }
  }, [open, activeCards]);

  const handleToggle = useCallback((id: string) => {
    triggerHaptic();
    setLocalActive(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleSave = useCallback(() => {
    setActiveCards(localActive);
    onClose();
  }, [localActive, setActiveCards, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {language === 'ja' ? 'ウィジェットの編集' : 'Edit Widgets'}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {allCardIds.map((id) => {
            const card = cardRegistry[id as keyof typeof cardRegistry];
            if (!card) return null;
            const isChecked = localActive.includes(id);
            return (
              <ListItem key={id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Checkbox checked={isChecked} onChange={() => handleToggle(id)} />
                <ListItemText primary={id} primaryTypographyProps={{ fontWeight: 600, textTransform: 'capitalize' }} />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', borderRadius: '12px' }}>{language === 'ja' ? 'キャンセル' : 'Cancel'}</Button>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: '12px', px: 3 }}>{language === 'ja' ? '保存' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const Home: FC = () => {
  const {
    language,
    expImageSearch,
    expHomeCards,
    activeHomeCards,
    expAiHistorySummary,
    geminiApiKey,
    widgetSizes,
    thirdPartyWidgets,
    hasCompletedSetup,
    notifications,
  } = useSearchStore(
    useShallow((s) => ({
      language: s.language,
      expImageSearch: s.expImageSearch,
      expHomeCards: s.expHomeCards,
      activeHomeCards: s.activeHomeCards,
      expAiHistorySummary: s.expAiHistorySummary,
      geminiApiKey: s.geminiApiKey,
      widgetSizes: s.widgetSizes,
      thirdPartyWidgets: s.thirdPartyWidgets,
      hasCompletedSetup: s.hasCompletedSetup,
      notifications: s.notifications,
    }))
  );
  const t = useMemo(() => translations[language], [language]);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [historySummary, setHistorySummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasWidgets = (expHomeCards && activeHomeCards.length > 0) || (expAiHistorySummary && geminiApiKey);

  // 初回設定ダイアログの自動表示
  useEffect(() => {
    if (!hasCompletedSetup && isPWA() && isMobile()) {
      setIsSetupOpen(true);
    }
  }, [hasCompletedSetup]);

  useEffect(() => {
    if (!expAiHistorySummary || !geminiApiKey) return;

    let isMounted = true;
    const loadSummary = async () => {
      const cached = localStorage.getItem('ai_history_summary_cache');
      const lastUpdate = localStorage.getItem('ai_history_summary_date');
      const now = new Date().getTime();
      
      if (cached && lastUpdate && now - parseInt(lastUpdate, 10) < 1000 * 60 * 60 * 24) {
        if (isMounted) setHistorySummary(cached);
        return;
      }

      setIsLoadingSummary(true);
      try {
        const history = getHistory();
        if (history.length < 5) {
          if (isMounted) setHistorySummary(language === 'ja' ? '検索履歴が少ないため、傾向を分析できません。' : 'Not enough search history to analyze trends.');
          return;
        }

        const queries = history.slice(0, 20).map(h => h.q).join(', ');
        const prompt = language === 'ja'
          ? `以下の検索履歴から、このユーザーが最近どのようなことに興味を持っているか、2〜3文で簡潔に要約して教えてください。ユーザーに話しかけるトーンで書いてください。\n\n検索履歴: ${queries}`
          : `Summarize the user's recent interests based on the following search history in 2-3 short sentences. Write in a conversational tone addressing the user.\n\nSearch History: ${queries}`;

        const summary = await generateGeminiContent(prompt, geminiApiKey);
        if (isMounted) {
          setHistorySummary(summary);
          localStorage.setItem('ai_history_summary_cache', summary);
          localStorage.setItem('ai_history_summary_date', now.toString());
        }
      } catch (error) {
        console.error("Failed to generate history summary", error);
      } finally {
        if (isMounted) setIsLoadingSummary(false);
      }
    };

    loadSummary();
    return () => { isMounted = false; };
  }, [expAiHistorySummary, geminiApiKey, language]);

  const handleLongPress = useCallback(() => {
    if (expHomeCards) {
       triggerHaptic();
       setIsEditMode(true);
    }
  }, [expHomeCards]);

  const longPressProps = useLongPress({
    onLongPress: handleLongPress,
    delay: 600,
  });

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleNavigateSettings = useCallback(() => {
    triggerHaptic();
    navigate('/settings');
  }, [navigate]);

  const handleEditDone = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleOpenEditDialog = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* 左上: 通知ボタン */}
      <Box
        sx={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 8px)',
          left: 8,
          zIndex: 100,
        }}
      >
        {!isEditMode && (
          <Tooltip title={language === 'ja' ? '通知' : 'Notifications'}>
            <IconButton
              size="small"
              onClick={() => { triggerHaptic(); setIsNotifyOpen(true); }}
              sx={{
                borderRadius: '10px',
                color: 'text.secondary',
                transition: 'transform 120ms ease-out, opacity 120ms ease-out',
                '&:active': { transform: 'scale(0.88)' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" variant="dot">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 右上: 設定ボタン (Fixed) */}
      <Box
        sx={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 8px)',
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          zIndex: 100,
        }}
      >
        {isEditMode ? (
          <Button variant="contained" size="small" onClick={handleEditDone} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
            {language === 'ja' ? '完了' : 'Done'}
          </Button>
        ) : (
          <Tooltip title={t.settings} placement="bottom-end">
            <IconButton
              size="small"
              onClick={handleNavigateSettings}
              sx={{
                borderRadius: '10px',
                color: 'text.secondary',
                transition: 'transform 120ms ease-out, opacity 120ms ease-out',
                '&:hover':  { opacity: 0.75 },
                '&:active': { transform: 'scale(0.88)' },
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 固定ヒーローセクション (Logo + SearchBox) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: hasWidgets ? { xs: '240px', md: '280px' } : '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backgroundColor: 'background.default',
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          px: { xs: 2, md: 3 },
          pt: 'calc(env(safe-area-inset-top) + 8px)',
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 3 }, width: '100%', display: 'flex', justifyContent: 'center', transform: hasWidgets ? 'scale(0.85)' : 'scale(1)', transition: 'transform 0.4s ease' }}>
          <Logo size="large" />
        </Box>

        {expImageSearch && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 1.5,
              '& .MuiTab-root': { textTransform: 'none', minHeight: 36, fontSize: '13px' },
              '& .MuiTabs-indicator': { borderRadius: '2px' },
            }}
          >
            <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label={t.search} />
            <Tab icon={<ImageSearchIcon fontSize="small" />} iconPosition="start" label={t.imageSearch} />
          </Tabs>
        )}

        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 600, md: 700 } }}>
          {activeTab === 0 || !expImageSearch ? (
            <SearchBox variant="home" />
          ) : (
            <ImageSearch />
          )}
        </Box>
      </Box>

      {/* スクロール可能なコンテンツ (Widgets) */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: hasWidgets ? 'auto' : 'hidden',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          pt: hasWidgets ? { xs: '240px', md: '280px' } : 0,
          // コンテンツが少ない時は高さを固定してスクロールさせない
          height: hasWidgets ? 'auto' : '100vh',
          maxHeight: '100vh',
          overscrollBehaviorY: 'contain',
        }}
        {...(expHomeCards && !isEditMode ? longPressProps : {})}
      >
        <Container maxWidth="md" sx={{ flexGrow: 1, pb: { xs: '100px', md: 4 }, pt: 2 }}>
          {expHomeCards && hasWidgets && (
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 600, md: 700 }, mx: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {language === 'ja' ? 'ウィジェット' : 'Widgets'}
                </Typography>
                {isEditMode && (
                  <Button size="small" startIcon={<EditIcon />} onClick={handleOpenEditDialog} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                    {language === 'ja' ? '編集' : 'Edit'}
                  </Button>
                )}
              </Box>
              
              {expAiHistorySummary && geminiApiKey && (
                <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AiIcon color="secondary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {language === 'ja' ? '最近の検索傾向' : 'Recent Search Trends'}
                    </Typography>
                  </Box>
                  {isLoadingSummary ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                       <CircularProgress size={24} />
                     </Box>
                  ) : (
                     <Typography variant="body2" color="text.secondary">
                       {historySummary}
                     </Typography>
                  )}
                  {isEditMode && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(var(--paper-rgb), 0.1)', borderRadius: '16px', zIndex: 10 }} />
                  )}
                </Paper>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  position: 'relative'
                }}
              >
                 {activeHomeCards.map((id) => {
                    const isThirdParty = id.startsWith('tp-');
                    const tpData = isThirdParty ? thirdPartyWidgets.find(w => w.id === id) : null;
                    const cardDef = !isThirdParty ? cardRegistry[id as keyof typeof cardRegistry] : null;
                    
                    if (!cardDef && !isThirdParty) return null;

                    const size = widgetSizes[id] || (cardDef?.defaultSize) || 'medium';
                    const isFullWidth = size === 'large';
                    const isSmall = size === 'small';

                    return (
                      <Box 
                        key={id} 
                        className="pm-card-stack"
                        sx={{ 
                          gridColumn: isFullWidth ? { xs: 'span 1', sm: 'span 2' } : 'span 1',
                          position: 'relative',
                          animation: isEditMode ? 'pm-shake 2s infinite ease-in-out' : 'none',
                          minHeight: isSmall ? 80 : 120,
                        }}
                      >
                         {isThirdParty && tpData ? (
                           <Paper elevation={0} sx={{ p: 0, borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%', minHeight: isSmall ? 80 : 120 }}>
                             <iframe 
                               srcDoc={`<html><head><style>body{margin:0;font-family:sans-serif;overflow:hidden;}</style></head><body>${tpData.code}</body></html>`}
                               style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isEditMode ? 'none' : 'auto' }}
                               sandbox="allow-scripts"
                               title={tpData.name}
                             />
                           </Paper>
                         ) : (
                           cardDef && (
                             <Suspense fallback={<Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: '16px' }} />}>
                                <cardDef.component />
                             </Suspense>
                           )
                         )}
                         
                         {isEditMode && (
                           <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(var(--paper-rgb), 0.05)', borderRadius: '16px', zIndex: 10, cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <IconButton size="small" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}><DragHandleIcon /></IconButton>
                           </Box>
                         )}
                      </Box>
                    );
                 })}
              </Box>
            </Box>
          )}
        </Container>
        <Footer />
        <BottomNavSpacer />
      </Box>

      <WidgetEditDialog open={isEditDialogOpen} onClose={handleCloseEditDialog} />

      <Suspense fallback={null}>
        <NotificationDialog open={isNotifyOpen} onClose={() => setIsNotifyOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <InitialSetupDialog open={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      </Suspense>
    </Box>
  );
};

export default Home;
