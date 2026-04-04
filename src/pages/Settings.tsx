import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  IconButton,
  Divider,
  Paper,
  MenuItem,
  Alert,
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
  ArrowBackOutlined as ArrowBackIcon,
  DarkModeOutlined as DarkModeIcon,
  LanguageOutlined as LanguageIcon,
  HistoryOutlined as HistoryIcon,
  AnimationOutlined as AnimationIcon,
  InfoOutlined as InfoIcon,
  SearchOutlined as SearchIcon,
  FilterListOutlined as FilterIcon,
  TimerOutlined as TimerIcon,
  PublicOutlined as PublicIcon,
  TranslateOutlined as TranslateIcon,
  ScienceOutlined as ScienceIcon,
  FormatListNumberedOutlined as ListIcon,
  ImageSearchOutlined as ImageSearchIcon,
  ChevronRightOutlined as ChevronRightIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SelectItem from '../components/settings/SelectItem';
import SwitchItem from '../components/settings/SwitchItem';

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
    expImageSearch, setExpImageSearch,
  } = useSearchStore();
  const t = translations[language];

  const [tapCount, setTapCount] = useState(0);
  const [expUnlocked, setExpUnlocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionTap = useCallback(() => {
    // 解除済みなら /labs へ遷移
    if (expUnlocked) {
      triggerHaptic();
      navigate('/labs');
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTapCount(0), TAP_RESET_MS);

    setTapCount((prev) => {
      const next = prev + 1;
      const remaining = TAP_REQUIRED - next;

      if (next >= TAP_REQUIRED) {
        setShowWarning(true);
        triggerHaptic();
        return 0;
      }

      if (next >= 2) {
        setSnackMsg(
          language === 'ja'
            ? `あと ${remaining} 回で実験的機能が解除されます`
            : `${remaining} more tap${remaining !== 1 ? 's' : ''} to unlock experimental features`
        );
      }

      return next;
    });
  }, [expUnlocked, language, navigate]);

  const handleWarningOk = useCallback(() => {
    setShowWarning(false);
    setExpUnlocked(true);
    triggerHaptic();
    // 解除後は即座に /labs へ遷移
    navigate('/labs');
  }, [navigate]);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t.settings}</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 2, pb: 8, flexGrow: 1 }}>

        {/* Display */}
        <SectionHeader label={t.sectionDisplay} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem icon={<DarkModeIcon />} primary={t.appearance} secondary={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} value={themeMode} onChange={setThemeMode}>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </SelectItem>
            <Divider />
            <SwitchItem icon={<AnimationIcon />} primary={t.enableAnimations} checked={enableAnimations} onChange={setEnableAnimations} />
          </List>
        </Paper>

        {/* Language */}
        <SectionHeader label={t.language} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem icon={<LanguageIcon />} primary={t.language} secondary={language === 'ja' ? '日本語' : 'English'} value={language} onChange={setLanguage}>
              <MenuItem value="ja">日本語</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* Search */}
        <SectionHeader label={t.sectionSearch} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem icon={<ListIcon />} primary={t.resultsPerPage} value={String(resultsPerPage)} onChange={(v) => setResultsPerPage(Number(v) as any)}>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem icon={<SearchIcon />} primary={t.defaultSearchType} value={defaultSearchType} onChange={setDefaultSearchType}>
              <MenuItem value="web">{t.all}</MenuItem>
              <MenuItem value="image">{t.images}</MenuItem>
              <MenuItem value="video">{t.videos}</MenuItem>
              <MenuItem value="news">{t.news}</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem icon={<FilterIcon />} primary={t.safeSearch} value={safeSearch} onChange={setSafeSearch}>
              <MenuItem value="off">{t.safeSearchOff}</MenuItem>
              <MenuItem value="moderate">{t.safeSearchModerate}</MenuItem>
              <MenuItem value="strict">{t.safeSearchStrict}</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem icon={<TimerIcon />} primary={t.cacheTtl} value={String(cacheTtl)} onChange={(v) => setCacheTtl(Number(v) as any)}>
              <MenuItem value="0">{t.cacheTtlNone}</MenuItem>
              <MenuItem value="5">{t.cacheTtl5}</MenuItem>
              <MenuItem value="30">{t.cacheTtl30}</MenuItem>
              <MenuItem value="60">{t.cacheTtl60}</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* Region */}
        <SectionHeader label={t.sectionRegion} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem icon={<PublicIcon />} primary={t.searchRegion} value={searchRegion} onChange={setSearchRegion}>
              <MenuItem value="JP">Japan (JP)</MenuItem>
              <MenuItem value="US">United States (US)</MenuItem>
              <MenuItem value="GB">United Kingdom (GB)</MenuItem>
              <MenuItem value="KR">Korea (KR)</MenuItem>
              <MenuItem value="CN">China (CN)</MenuItem>
              <MenuItem value="DE">Germany (DE)</MenuItem>
              <MenuItem value="FR">France (FR)</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem icon={<TranslateIcon />} primary={t.searchLang} value={searchLang} onChange={setSearchLang}>
              <MenuItem value="ja">日本語 (ja)</MenuItem>
              <MenuItem value="en">English (en)</MenuItem>
              <MenuItem value="ko">한국어 (ko)</MenuItem>
              <MenuItem value="zh-CN">中文 (zh-CN)</MenuItem>
              <MenuItem value="de">Deutsch (de)</MenuItem>
              <MenuItem value="fr">Français (fr)</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* Privacy */}
        <SectionHeader label={t.sectionPrivacy} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem icon={<HistoryIcon />} primary={t.saveHistory} checked={saveHistory} onChange={setSaveHistory} />
          </List>
        </Paper>

        {/* About */}
        <SectionHeader label={t.about} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <ListItem
              sx={{ py: 1.5, cursor: 'pointer', userSelect: 'none' }}
              onClick={handleVersionTap}
            >
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText
                primary="Version"
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    1.2.0
                    {expUnlocked && (
                      <Chip
                        label={language === 'ja' ? '実験的機能解除済' : 'Experimental unlocked'}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '11px', height: 20 }}
                      />
                    )}
                  </Box>
                }
              />
              {/* 解除前後とも chevron を表示し、解除後は /labs 遷移を表現 */}
              <ChevronRightIcon sx={{ color: expUnlocked ? 'warning.main' : 'text.disabled', transition: 'color 0.2s' }} />
            </ListItem>
          </List>
        </Paper>

      </Container>

      {/* 警告ダイアログ */}
      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        PaperProps={{ sx: { borderRadius: '16px', mx: 2 } }}
      >
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
          <Button
            onClick={() => setShowWarning(false)}
            sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}
          >
            {language === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
          <Button
            onClick={handleWarningOk}
            variant="contained"
            color="warning"
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            {language === 'ja' ? '理解した上で解除する' : 'I understand, unlock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* カウントダウンスナック */}
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
