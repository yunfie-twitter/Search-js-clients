import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SelectItem from '../components/settings/SelectItem';
import SwitchItem from '../components/settings/SwitchItem';

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

  const [expAiSummary, setExpAiSummary] = useState(false);
  const [expInstantResults, setExpInstantResults] = useState(false);
  const [expKnowledgePanel, setExpKnowledgePanel] = useState(false);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
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
              <MenuItem value="JP">🇯🇵 Japan (JP)</MenuItem>
              <MenuItem value="US">🇺🇸 United States (US)</MenuItem>
              <MenuItem value="GB">🇬🇧 United Kingdom (GB)</MenuItem>
              <MenuItem value="KR">🇰🇷 Korea (KR)</MenuItem>
              <MenuItem value="CN">🇨🇳 China (CN)</MenuItem>
              <MenuItem value="DE">🇩🇪 Germany (DE)</MenuItem>
              <MenuItem value="FR">🇫🇷 France (FR)</MenuItem>
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

        {/* Experimental */}
        <SectionHeader label={t.sectionExperimental} />
        <Alert severity="warning" sx={{ mx: 0, mb: 1.5, borderRadius: '12px', fontSize: '13px' }}>
          {t.experimentalNote}
        </Alert>
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem icon={<ScienceIcon />} primary={t.experimentalAiSummary} secondary={t.experimentalAiSummaryDesc} checked={expAiSummary} onChange={setExpAiSummary} chip="β" disabled />
            <Divider />
            <SwitchItem icon={<ScienceIcon />} primary={t.experimentalInstantResults} secondary={t.experimentalInstantResultsDesc} checked={expInstantResults} onChange={setExpInstantResults} chip="β" disabled />
            <Divider />
            <SwitchItem icon={<ScienceIcon />} primary={t.experimentalKnowledgePanel} secondary={t.experimentalKnowledgePanelDesc} checked={expKnowledgePanel} onChange={setExpKnowledgePanel} chip="β" disabled />
            <Divider />
            {/* CLIP 画像検索：実動作する実験的機能 */}
            <SwitchItem
              icon={<ImageSearchIcon />}
              primary={t.experimentalImageSearch}
              secondary={t.experimentalImageSearchDesc}
              checked={expImageSearch}
              onChange={setExpImageSearch}
              chip="β"
            />
          </List>
        </Paper>

        {/* About */}
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
