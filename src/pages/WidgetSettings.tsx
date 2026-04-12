import React, { useState } from 'react';
import {
  Box, Container, Typography, List, ListItem, ListItemText,
  IconButton, Paper, Button,
  ToggleButtonGroup, ToggleButton, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  WidgetsOutlined as WidgetIcon,
  TouchAppOutlined as TouchAppIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerHaptic } from '../utils/haptics';
import { BottomNavSpacer } from '../components/MobileBottomNav';

const WidgetSettings: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    language,
    widgetSizes, setWidgetSizes,
    thirdPartyWidgets, setThirdPartyWidgets,
    activeHomeCards, setActiveHomeCards,
  } = useSearchStore(useShallow(s => ({ language: s.language, widgetSizes: s.widgetSizes, setWidgetSizes: s.setWidgetSizes, thirdPartyWidgets: s.thirdPartyWidgets, setThirdPartyWidgets: s.setThirdPartyWidgets, activeHomeCards: s.activeHomeCards, setActiveHomeCards: s.setActiveHomeCards })));
  
  const [snackMsg, setSnackMsg] = useState('');
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [newWidgetName, setNewWidgetName] = useState('');
  const [newWidgetCode, setNewWidgetCode] = useState('');

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  const handleInstallWidget = () => {
    if (!newWidgetName || !newWidgetCode) return;
    const id = `tp-${Math.random().toString(36).substring(7)}`;
    const newWidget = { id, name: newWidgetName, code: newWidgetCode };
    setThirdPartyWidgets([...thirdPartyWidgets, newWidget]);
    setActiveHomeCards([...activeHomeCards, id]);
    setNewWidgetName('');
    setNewWidgetCode('');
    setIsWidgetDialogOpen(false);
    setSnackMsg(language === 'ja' ? 'ウィジェットをインストールしました' : 'Widget installed');
    triggerHaptic();
  };

  const handleDeleteWidget = (id: string) => {
    setThirdPartyWidgets(thirdPartyWidgets.filter(w => w.id !== id));
    setActiveHomeCards(activeHomeCards.filter(cid => cid !== id));
    setSnackMsg(language === 'ja' ? 'ウィジェットを削除しました' : 'Widget deleted');
    triggerHaptic();
  };

  const handleSizeChange = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgetSizes({ ...widgetSizes, [id]: size });
    triggerHaptic();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', 
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'background.default' 
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        pt: 'calc(env(safe-area-inset-top) + 16px)',
        display: 'flex', alignItems: 'center',
        backgroundColor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider',
        zIndex: 10,
      }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WidgetIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {language === 'ja' ? 'ウィジェット設定' : 'Widget Settings'}
          </Typography>
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="sm" sx={{ py: 2, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
              {language === 'ja' ? '配置済みのウィジェット' : 'Active Widgets'}
            </Typography>
            <Button 
              size="small" variant="contained" startIcon={<TouchAppIcon />} 
              onClick={() => setIsWidgetDialogOpen(true)}
              sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: 'none' }}
            >
              {language === 'ja' ? '新規追加' : 'New Widget'}
            </Button>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <List sx={{ py: 0 }}>
              {activeHomeCards.map((id, index) => {
                const size = widgetSizes[id] || 'medium';
                const isThirdParty = id.startsWith('tp-');
                const tpData = isThirdParty ? thirdPartyWidgets.find(w => w.id === id) : null;
                const label = tpData ? tpData.name : id;

                return (
                  <ListItem key={id} sx={{ py: 1.5, borderBottom: index === activeHomeCards.length - 1 ? 'none' : '1px solid', borderColor: 'divider' }}>
                    <ListItemText 
                      primary={label} 
                      primaryTypographyProps={{ fontWeight: 600, textTransform: 'capitalize' }} 
                      secondary={isThirdParty ? 'Third-party' : 'System'}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ToggleButtonGroup
                        size="small"
                        value={size}
                        exclusive
                        onChange={(_, v) => { if(v) handleSizeChange(id, v); }}
                        sx={{ height: 32 }}
                      >
                        <ToggleButton value="small" sx={{ px: 1.5, fontSize: '11px' }}>S</ToggleButton>
                        <ToggleButton value="medium" sx={{ px: 1.5, fontSize: '11px' }}>M</ToggleButton>
                        <ToggleButton value="large" sx={{ px: 1.5, fontSize: '11px' }}>L</ToggleButton>
                      </ToggleButtonGroup>
                      {isThirdParty && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteWidget(id)}>
                          <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                );
              })}
              {activeHomeCards.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
                  {language === 'ja' ? 'ウィジェットがありません' : 'No active widgets'}
                </Box>
              )}
            </List>
          </Paper>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
              {language === 'ja' 
                ? '※ ウィジェットの表示順序はホーム画面の長押し編集モードで変更できます。' 
                : '* You can change the order of widgets in the long-press edit mode on the home screen.'}
            </Typography>
          </Box>
        </Container>
        <BottomNavSpacer />
      </Box>

      <Snackbar
        open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')}
        message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { borderRadius: '12px', fontSize: '13px' } }}
      />

      <Dialog open={isWidgetDialogOpen} onClose={() => setIsWidgetDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{language === 'ja' ? 'カスタムウィジェットの追加' : 'Add Custom Widget'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label={language === 'ja' ? '名前' : 'Widget Name'}
            value={newWidgetName} onChange={(e) => setNewWidgetName(e.target.value)}
            sx={{ mt: 1, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            fullWidth multiline rows={8}
            label={language === 'ja' ? 'コード (HTML/JS/CSS)' : 'Widget Code (HTML/JS/CSS)'}
            placeholder="<div style='color: blue'>Hello World</div>"
            value={newWidgetCode} onChange={(e) => setNewWidgetCode(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setIsWidgetDialogOpen(false)} sx={{ borderRadius: '10px' }}>{language === 'ja' ? 'キャンセル' : 'Cancel'}</Button>
          <Button variant="contained" onClick={handleInstallWidget} sx={{ borderRadius: '10px', px: 3, boxShadow: 'none' }}>{language === 'ja' ? 'インストール' : 'Install'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WidgetSettings;
