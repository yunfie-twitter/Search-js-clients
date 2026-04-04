import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Switch, 
  IconButton, 
  Divider, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Alert
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
  FormatListNumberedOutlined as ListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';

// セクションヘッダー
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ px: 2, pt: 3, pb: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '11px' }}>
      {label}
    </Typography>
  </Box>
);

// セレクト付きリストアイテム
const SelectItem: React.FC<{
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  value: string;
  onChange: (v: any) => void;
  children: React.ReactNode;
}> = ({ icon, primary, secondary, value, onChange, children }) => (
  <ListItem sx={{ py: 1.5 }}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={primary} secondary={secondary} />
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <Select value={value} onChange={(e) => { triggerHaptic(); onChange(e.target.value); }} sx={{ borderRadius: '8px' }}>
        {children}
      </Select>
    </FormControl>
  </ListItem>
);

// スイッチ付きリストアイテム
const SwitchItem: React.FC<{
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  chip?: string;
}> = ({ icon, primary, secondary, checked, onChange, disabled, chip }) => (
  <ListItem sx={{ py: 1.5, opacity: disabled ? 0.5 : 1 }}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {primary}
          {chip && <Chip label={chip} size="small" color="warning" sx={{ height: 18, fontSize: '10px', fontWeight: 700 }} />}
        </Box>
      }
      secondary={secondary}
    />
    <Switch checked={checked} onChange={(e) => { triggerHaptic(); onChange(e.target.checked); }} disabled={disabled} />
  </ListItem>
);

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
  } = useSearchStore();
  const t = translations[language];

  // 実験的機能は画面表示のみ（状態は保存しない）
  const [expAiSummary, setExpAiSummary] = useState(false);
  const [expInstantResults, setExpInstantResults] = useState(false);
  const [expKnowledgePanel, setExpKnowledgePanel] = useState(false);

  const handleBack = () => {
    triggerHaptic();
    navigate(-1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t.settings}
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 2, pb: 8, flexGrow: 1 }}>

        {/* ── 表示 ── */}
        <SectionHeader label={t.sectionDisplay} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem
              icon={<DarkModeIcon />}
              primary={t.appearance}
              secondary={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
              value={themeMode}
              onChange={setThemeMode}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </SelectItem>
            <Divider />
            <SwitchItem icon={<AnimationIcon />} primary={language === 'ja' ? 'アニメーションを有効にする' : 'Enable Animations'} checked={enableAnimations} onChange={setEnableAnimations} />
          </List>
        </Paper>

        {/* ── 言語 ── */}
        <SectionHeader label={t.language} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem
              icon={<LanguageIcon />}
              primary={t.language}
              secondary={language === 'ja' ? '日本語' : 'English'}
              value={language}
              onChange={setLanguage}
            >
              <MenuItem value="ja">日本語</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* ── 検索 ── */}
        <SectionHeader label={t.sectionSearch} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem
              icon={<ListIcon />}
              primary={t.resultsPerPage}
              value={String(resultsPerPage)}
              onChange={(v) => setResultsPerPage(Number(v) as any)}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem
              icon={<SearchIcon />}
              primary={t.defaultSearchType}
              value={defaultSearchType}
              onChange={setDefaultSearchType}
            >
              <MenuItem value="web">{t.all}</MenuItem>
              <MenuItem value="image">{t.images}</MenuItem>
              <MenuItem value="video">{t.videos}</MenuItem>
              <MenuItem value="news">{t.news}</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem
              icon={<FilterIcon />}
              primary={t.safeSearch}
              value={safeSearch}
              onChange={setSafeSearch}
            >
              <MenuItem value="off">{t.safeSearchOff}</MenuItem>
              <MenuItem value="moderate">{t.safeSearchModerate}</MenuItem>
              <MenuItem value="strict">{t.safeSearchStrict}</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem
              icon={<TimerIcon />}
              primary={t.cacheTtl}
              value={String(cacheTtl)}
              onChange={(v) => setCacheTtl(Number(v) as any)}
            >
              <MenuItem value="0">{t.cacheTtlNone}</MenuItem>
              <MenuItem value="5">{t.cacheTtl5}</MenuItem>
              <MenuItem value="30">{t.cacheTtl30}</MenuItem>
              <MenuItem value="60">{t.cacheTtl60}</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* ── 地域・言語 ── */}
        <SectionHeader label={t.sectionRegion} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SelectItem
              icon={<PublicIcon />}
              primary={t.searchRegion}
              value={searchRegion}
              onChange={setSearchRegion}
            >
              <MenuItem value="JP">🇯🇵 Japan (JP)</MenuItem>
              <MenuItem value="US">🇺🇸 United States (US)</MenuItem>
              <MenuItem value="GB">🇬🇧 United Kingdom (GB)</MenuItem>
              <MenuItem value="KR">🇰🇷 Korea (KR)</MenuItem>
              <MenuItem value="CN">🇨🇳 China (CN)</MenuItem>
              <MenuItem value="DE">🇩🇪 Germany (DE)</MenuItem>
              <MenuItem value="FR">🇫🇷 France (FR)</MenuItem>
            </SelectItem>
            <Divider />
            <SelectItem
              icon={<TranslateIcon />}
              primary={t.searchLang}
              value={searchLang}
              onChange={setSearchLang}
            >
              <MenuItem value="ja">日本語 (ja)</MenuItem>
              <MenuItem value="en">English (en)</MenuItem>
              <MenuItem value="ko">한국어 (ko)</MenuItem>
              <MenuItem value="zh-CN">中文 (zh-CN)</MenuItem>
              <MenuItem value="de">Deutsch (de)</MenuItem>
              <MenuItem value="fr">Français (fr)</MenuItem>
            </SelectItem>
          </List>
        </Paper>

        {/* ── プライバシー ── */}
        <SectionHeader label={t.sectionPrivacy} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem icon={<HistoryIcon />} primary={language === 'ja' ? '検索履歴を保存する' : 'Save Search History'} checked={saveHistory} onChange={setSaveHistory} />
          </List>
        </Paper>

        {/* ── 実験的な機能 ── */}
        <SectionHeader label={t.sectionExperimental} />
        <Alert severity="warning" sx={{ mx: 0, mb: 1.5, borderRadius: '12px', fontSize: '13px' }}>
          {t.experimentalNote}
        </Alert>
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalAiSummary}
              secondary={t.experimentalAiSummaryDesc}
              checked={expAiSummary}
              onChange={setExpAiSummary}
              chip="β"
              disabled
            />
            <Divider />
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalInstantResults}
              secondary={t.experimentalInstantResultsDesc}
              checked={expInstantResults}
              onChange={setExpInstantResults}
              chip="β"
              disabled
            />
            <Divider />
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalKnowledgePanel}
              secondary={t.experimentalKnowledgePanelDesc}
              checked={expKnowledgePanel}
              onChange={setExpKnowledgePanel}
              chip="β"
              disabled
            />
          </List>
        </Paper>

        {/* ── バージョン ── */}
        <SectionHeader label={t.about} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ py: 1.5 }}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="Version" secondary="1.2.0" />
            </ListItem>
          </List>
        </Paper>

      </Container>
    </Box>
  );
};

export default Settings;
