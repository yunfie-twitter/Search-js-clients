import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  List,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  HistoryOutlined as HistoryIcon,
  InfoOutlined as InfoIcon,
  ChevronRightOutlined as ChevronRightIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { BottomNavSpacer } from '../components/MobileBottomNav';
import SettingsDisplaySection from '../components/settings/SettingsDisplaySection';
import SettingsSearchSection from '../components/settings/SettingsSearchSection';
import SettingsRegionSection from '../components/settings/SettingsRegionSection';

const TAP_REQUIRED = 5;
const TAP_RESET_MS = 2000;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    themeMode, setThemeMode,
    language, setLanguage,
    saveHistory, setSaveHistory,
    enableAnimations, setEnableAnimations,
    resultsPerPage, setResultsPerPage,
    defaultSearchType, setDefaultSearchType,
    safeSearch, setSafeSearch,
    cacheTtl, setCacheTtl,
    searchRegion, setSearchRegion,
    searchLang, setSearchLang,
    expUnlocked, setExpUnlocked,
  } = useSearchStore();
  const t = translations[language];

  const [tapCount, setTapCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionTap = useCallback(() => {
    if (expUnlocked) { triggerHaptic(); navigate('/labs'); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTapCount(0), TAP_RESET_MS);
    setTapCount((prev) => {
      const next = prev + 1;
      const remaining = TAP_REQUIRED - next;
      if (next >= TAP_REQUIRED) { setShowWarning(true); triggerHaptic(); return 0; }
      if (next >= 2) {
        setSnackMsg(language === 'ja'
          ? `あと ${remaining} 回で実験的機能が解除されます`
          : `${remaining} more tap${remaining !== 1 ? 's' : ''} to unlock experimental features`);
      }
      return next;
    });
  }, [expUnlocked, language, navigate]);

  const handleWarningOk = useCallback(() => {
    setShowWarning(false);
    setExpUnlocked(true);
    triggerHaptic();
    navigate('/labs');
  }, [navigate, setExpUnlocked]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* PageHeader はアニメ外 */}
      <PageHeader title={t.settings} />

      <PageTransition>
        <Container maxWidth="sm" sx={{ py: 2, flexGrow: 1 }}>
          <SettingsDisplaySection
            t={t}
            themeMode={themeMode} setThemeMode={setThemeMode}
            enableAnimations={enableAnimations} setEnableAnimations={setEnableAnimations}
            language={language} setLanguage={setLanguage}
          />
          <SettingsSearchSection
            t={t}
            resultsPerPage={resultsPerPage} setResultsPerPage={setResultsPerPage}
            defaultSearchType={defaultSearchType} setDefaultSearchType={setDefaultSearchType}
            safeSearch={safeSearch} setSafeSearch={setSafeSearch}
            cacheTtl={cacheTtl} setCacheTtl={setCacheTtl}
          />
          <SettingsRegionSection
            t={t}
            searchRegion={searchRegion} setSearchRegion={setSearchRegion}
            searchLang={searchLang} setSearchLang={setSearchLang}
          />
          <SectionHeader label={t.sectionPrivacy} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <List sx={{ py: 0 }}>
              <SwitchItem icon={<HistoryIcon />} primary={t.saveHistory} checked={saveHistory} onChange={setSaveHistory} />
            </List>
          </Paper>
          <SectionHeader label={t.about} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <List sx={{ py: 0 }}>
              <ListItem sx={{ py: 1.5, cursor: 'pointer', userSelect: 'none' }} onClick={handleVersionTap}>
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText
                  primary="Version"
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      1.2.0
                      {expUnlocked && (
                        <Chip label={language === 'ja' ? '実験的機能解除済' : 'Experimental unlocked'} size="small" color="warning" variant="outlined" sx={{ fontSize: '11px', height: 20 }} />
                      )}
                    </Box>
                  }
                />
                <ChevronRightIcon sx={{ color: expUnlocked ? 'warning.main' : 'text.disabled', transition: 'color 0.2s' }} />
              </ListItem>
            </List>
          </Paper>
        </Container>
        <BottomNavSpacer />
      </PageTransition>

      <Dialog open={showWarning} onClose={() => setShowWarning(false)} PaperProps={{ sx: { borderRadius: '16px', mx: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {language === 'ja' ? '実験的機能' : 'Experimental Features'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px', lineHeight: 1.7 }}>
            {language === 'ja'
              ? '実験的機能は開発中の機能です。予告なく変更・削除される可能性があり、動作が不安定になる場合があります。了承の上でご利用ください。'
              : 'These are features under development. They may change or be removed without notice, and may cause instability. Use at your own risk.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setShowWarning(false)} sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}>
            {language === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
          <Button onClick={handleWarningOk} variant="contained" color="warning" sx={{ textTransform: 'none', borderRadius: '10px' }}>
            {language === 'ja' ? '理解した上で解除する' : 'I understand, unlock'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={1000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { borderRadius: '12px', fontSize: '13px' } }}
      />
    </Box>
  );
};

export default Settings;
