import React, { useState } from 'react';
import {
  Box, Container, Typography, List,
  IconButton, Divider, Paper, Alert,
  TextField, InputAdornment, Collapse, Button,
  Snackbar, MenuItem
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  ScienceOutlined  as ScienceIcon,
  ImageSearchOutlined as ImageSearchIcon,
  WarningAmberOutlined as WarningIcon,
  AutoAwesomeOutlined as AiIcon,
  VisibilityOutlined as ShowIcon,
  VisibilityOffOutlined as HideIcon,
  TravelExploreOutlined as KnowledgeIcon,
  FactCheckOutlined as FactCheckIcon,
  MergeOutlined as MergeIcon,
  ViewCarouselOutlined as ViewCarouselIcon,
  PaletteOutlined as PaletteIcon,
  FormatSizeOutlined as FontSizeIcon,
  SummarizeOutlined as SummaryIcon,
  TouchAppOutlined as TouchAppIcon,
  WbSunnyOutlined as WeatherIcon,
  ImportExportOutlined as SyncAltIcon,
  SwipeVerticalOutlined as SwapVertIcon,
  ScreenShareOutlined as ScreenShareIcon,
  FullscreenOutlined as FullscreenIcon,
  DynamicFeedOutlined as ExpandIcon,
  SwipeOutlined as SwipeIcon,
  ViewAgendaOutlined as DensityIcon,
  ViewAgendaOutlined as ViewAgendaIcon,
  WebAssetOutlined as WebIcon,
  DescriptionOutlined as MarkdownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';
import SelectItem from '../components/settings/SelectItem';
import { BottomNavSpacer } from '../components/MobileBottomNav';

const Labs: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    language,
    expNativeScrollBounce, setExpNativeScrollBounce,
    expNativePageTransition, setExpNativePageTransition,
    expNativeHapticFeedback, setExpNativeHapticFeedback,
    expNativeContextMenu, setExpNativeContextMenu,
    expNativePullToRefresh, setExpNativePullToRefresh,
    exp3dTouch, setExp3dTouch,
    expImageSearch, setExpImageSearch,
    expAiSummary, setExpAiSummary,
    expKnowledgePanel, setExpKnowledgePanel,
    expGeminiFactCheck, setExpGeminiFactCheck,
    expMergedAiPanel, setExpMergedAiPanel,
    expHomeCards, setExpHomeCards,
    expCustomAccentColor, setExpCustomAccentColor,
    accentColor, setAccentColor,
    expCustomFontSize, setExpCustomFontSize,
    fontSizeBase, setFontSizeBase,
    expAiHistorySummary, setExpAiHistorySummary,
    expLongPressMenu, setExpLongPressMenu,
    expWeatherCard, setExpWeatherCard,
    expSettingsExportImport, setExpSettingsExportImport,
    expScrollHeader, setExpScrollHeader,
    expScreenshotShare, setExpScreenshotShare,
    expFocusMode, setExpFocusMode,
    expQueryExpansion, setExpQueryExpansion,
    expSwipeActions, setExpSwipeActions,
    expViewDensity, setExpViewDensity,
    expMiniBrowser, setExpMiniBrowser,
    expColorBlindMode, setExpColorBlindMode,
    geminiApiKey, setGeminiApiKey,
    expNewsMarkdown, setExpNewsMarkdown,
    markdownApiEndpoint, setMarkdownApiEndpoint,
    markdownApiMethod, setMarkdownApiMethod,
    expUseInvidious, setExpUseInvidious,
    invidiousInstance, setInvidiousInstance,
  } = useSearchStore(useShallow(s => ({
    language: s.language,
    expUseInvidious: s.expUseInvidious, setExpUseInvidious: s.setExpUseInvidious,
    invidiousInstance: s.invidiousInstance, setInvidiousInstance: s.setInvidiousInstance,
    expNativeScrollBounce: s.expNativeScrollBounce, setExpNativeScrollBounce: s.setExpNativeScrollBounce,
    expNativePageTransition: s.expNativePageTransition, setExpNativePageTransition: s.setExpNativePageTransition,
    expNativeHapticFeedback: s.expNativeHapticFeedback, setExpNativeHapticFeedback: s.setExpNativeHapticFeedback,
    expNativeContextMenu: s.expNativeContextMenu, setExpNativeContextMenu: s.setExpNativeContextMenu,
    expNativePullToRefresh: s.expNativePullToRefresh, setExpNativePullToRefresh: s.setExpNativePullToRefresh,
    exp3dTouch: s.exp3dTouch, setExp3dTouch: s.setExp3dTouch,
    expImageSearch: s.expImageSearch, setExpImageSearch: s.setExpImageSearch,
    expAiSummary: s.expAiSummary, setExpAiSummary: s.setExpAiSummary,
    expKnowledgePanel: s.expKnowledgePanel, setExpKnowledgePanel: s.setExpKnowledgePanel,
    expGeminiFactCheck: s.expGeminiFactCheck, setExpGeminiFactCheck: s.setExpGeminiFactCheck,
    expMergedAiPanel: s.expMergedAiPanel, setExpMergedAiPanel: s.setExpMergedAiPanel,
    expHomeCards: s.expHomeCards, setExpHomeCards: s.setExpHomeCards,
    expCustomAccentColor: s.expCustomAccentColor, setExpCustomAccentColor: s.setExpCustomAccentColor,
    accentColor: s.accentColor, setAccentColor: s.setAccentColor,
    expCustomFontSize: s.expCustomFontSize, setExpCustomFontSize: s.setExpCustomFontSize,
    fontSizeBase: s.fontSizeBase, setFontSizeBase: s.setFontSizeBase,
    expAiHistorySummary: s.expAiHistorySummary, setExpAiHistorySummary: s.setExpAiHistorySummary,
    expLongPressMenu: s.expLongPressMenu, setExpLongPressMenu: s.setExpLongPressMenu,
    expWeatherCard: s.expWeatherCard, setExpWeatherCard: s.setExpWeatherCard,
    expSettingsExportImport: s.expSettingsExportImport, setExpSettingsExportImport: s.setExpSettingsExportImport,
    expScrollHeader: s.expScrollHeader, setExpScrollHeader: s.setExpScrollHeader,
    expScreenshotShare: s.expScreenshotShare, setExpScreenshotShare: s.setExpScreenshotShare,
    expFocusMode: s.expFocusMode, setExpFocusMode: s.setExpFocusMode,
    expQueryExpansion: s.expQueryExpansion, setExpQueryExpansion: s.setExpQueryExpansion,
    expSwipeActions: s.expSwipeActions, setExpSwipeActions: s.setExpSwipeActions,
    expViewDensity: s.expViewDensity, setExpViewDensity: s.setExpViewDensity,
    expMiniBrowser: s.expMiniBrowser, setExpMiniBrowser: s.setExpMiniBrowser,
    expColorBlindMode: s.expColorBlindMode, setExpColorBlindMode: s.setExpColorBlindMode,
    geminiApiKey: s.geminiApiKey, setGeminiApiKey: s.setGeminiApiKey,
    expNewsMarkdown: s.expNewsMarkdown, setExpNewsMarkdown: s.setExpNewsMarkdown,
    markdownApiEndpoint: s.markdownApiEndpoint, setMarkdownApiEndpoint: s.setMarkdownApiEndpoint,
    markdownApiMethod: s.markdownApiMethod, setMarkdownApiMethod: s.setMarkdownApiMethod
  })));

  const t = React.useMemo(() => translations[language], [language]);

  const [showKey, setShowKey] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const handleBack = () => { triggerHaptic(); navigate(-1); };
  const handleGoToWidgets = () => { triggerHaptic(); navigate('/widget'); };

  const bothAiEnabled = expAiSummary && expKnowledgePanel;

  const handleExportSettings = () => {
    const data = localStorage.getItem('wholphin_settings') || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wholphin_settings.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json && typeof json === 'object') {
          localStorage.setItem('wholphin_settings', JSON.stringify(json));
          window.location.reload();
        }
      } catch (err) {
        alert(language === 'ja' ? '無効なファイルです' : 'Invalid file format');
      }
    };
    reader.readAsText(file);
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
          <ScienceIcon sx={{ color: 'warning.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t.sectionExperimental}
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
          <Alert severity="warning" icon={<WarningIcon />}
            sx={{ mb: 2, borderRadius: '12px', fontSize: '13px' }}>
            {t.experimentalNote}
          </Alert>

          {/* ─ UI/UX ─ */}
          <SectionHeader title={language === 'ja' ? 'UI/UX' : 'UI/UX'} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <List sx={{ py: 0 }}>
              <SwitchItem
                icon={<TouchAppIcon />}
                primary={language === 'ja' ? '3D Touch再現（β）' : '3D Touch Simulator (β)'}
                checked={exp3dTouch}
                onChange={setExp3dTouch}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<SwapVertIcon />}
                primary={language === 'ja' ? 'ネイティブ風スクロールバウンス（β）' : 'Native Scroll Bounce (β)'}
                checked={expNativeScrollBounce}
                onChange={setExpNativeScrollBounce}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<ViewCarouselIcon />}
                primary={language === 'ja' ? 'ネイティブ風ページ遷移（β）' : 'Native Page Transition (β)'}
                checked={expNativePageTransition}
                onChange={setExpNativePageTransition}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<AiIcon />}
                primary={language === 'ja' ? '高度なネイティブハプティック（β）' : 'Advanced Native Haptic (β)'}
                checked={expNativeHapticFeedback}
                onChange={setExpNativeHapticFeedback}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<ViewAgendaIcon />}
                primary={language === 'ja' ? 'ネイティブ風コンテキストメニュー（β）' : 'Native Context Menu (β)'}
                checked={expNativeContextMenu}
                onChange={setExpNativeContextMenu}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<SwipeIcon />}
                primary={language === 'ja' ? 'ネイティブ風引っ張って更新（β）' : 'Native Pull-to-Refresh (β)'}
                checked={expNativePullToRefresh}
                onChange={setExpNativePullToRefresh}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<ViewCarouselIcon />}
                primary={language === 'ja' ? 'ホーム画面カード（β）' : 'Home Screen Cards (β)'}
                secondary={language === 'ja'
                  ? 'ホーム画面に情報カードを表示します。長押しでウィジェットを編集できます。'
                  : 'Shows informational cards on the home screen. Long press to edit widgets.'}
                checked={expHomeCards}
                onChange={setExpHomeCards}
                chip="β"
              />
              <Collapse in={expHomeCards}>
                <Divider />
                <Box sx={{ px: 2, py: 2 }}>
                  <Button 
                    fullWidth variant="outlined" startIcon={<TouchAppIcon />} 
                    onClick={handleGoToWidgets}
                    sx={{ borderRadius: '12px', textTransform: 'none', py: 1 }}
                  >
                    {language === 'ja' ? 'ウィジェットの詳細設定・サイズ変更' : 'Advanced Widget Settings & Sizing'}
                  </Button>
                </Box>
              </Collapse>
              <Divider />
              <SwitchItem
                icon={<WeatherIcon />}
                primary={language === 'ja' ? '天気カード（β）' : 'Weather Card (β)'}
                checked={expWeatherCard}
                onChange={setExpWeatherCard}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<SwapVertIcon />}
                primary={language === 'ja' ? 'スクロール連動ヘッダー折りたたみ（β）' : 'Scroll-linked Header Collapse (β)'}
                checked={expScrollHeader}
                onChange={setExpScrollHeader}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<DensityIcon />}
                primary={language === 'ja' ? '結果ビュー密度切り替え（β）' : 'Result View Density (β)'}
                checked={expViewDensity}
                onChange={setExpViewDensity}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<SwipeIcon />}
                primary={language === 'ja' ? '結果カードのスワイプアクション（β）' : 'Swipe Actions for Cards (β)'}
                checked={expSwipeActions}
                onChange={setExpSwipeActions}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<PaletteIcon />}
                primary={language === 'ja' ? 'カラーブラインドモード（β）' : 'Color Blind Mode (β)'}
                checked={expColorBlindMode}
                onChange={setExpColorBlindMode}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<PaletteIcon />}
                primary={language === 'ja' ? 'カスタムアクセントカラー（β）' : 'Custom Accent Color (β)'}
                checked={expCustomAccentColor}
                onChange={setExpCustomAccentColor}
                chip="β"
              />
              <Collapse in={expCustomAccentColor}>
                <Divider />
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{language === 'ja' ? 'カラーを選択' : 'Select Color'}</Typography>
                  <input
                    type="color"
                    value={accentColor || '#007aff'}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{ border: 'none', width: '32px', height: '32px', borderRadius: '50%', padding: 0, cursor: 'pointer' }}
                  />
                </Box>
              </Collapse>
              <Divider />
              <SwitchItem
                icon={<FontSizeIcon />}
                primary={language === 'ja' ? 'フォントサイズ調整（β）' : 'Font Size Adjustment (β)'}
                checked={expCustomFontSize}
                onChange={setExpCustomFontSize}
                chip="β"
              />
              <Collapse in={expCustomFontSize}>
                <Divider />
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>{fontSizeBase}px</Typography>
                  <input type="range" min="12" max="24" step="1" value={fontSizeBase} onChange={(e) => setFontSizeBase(Number(e.target.value))} style={{ flexGrow: 1 }} />
                </Box>
              </Collapse>
              <Divider />
              <SwitchItem
                icon={<TouchAppIcon />}
                primary={language === 'ja' ? '長押しコンテキストメニュー（β）' : 'Long Press Context Menu (β)'}
                checked={expLongPressMenu}
                onChange={setExpLongPressMenu}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<ScreenShareIcon />}
                primary={language === 'ja' ? '結果スクリーンショット共有（β）' : 'Screenshot Share (β)'}
                checked={expScreenshotShare}
                onChange={setExpScreenshotShare}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<FullscreenIcon />}
                primary={language === 'ja' ? '検索結果フォーカスモード（β）' : 'Focus Mode (β)'}
                checked={expFocusMode}
                onChange={setExpFocusMode}
                chip="β"
              />
            </List>
          </Paper>

          {/* ─ AI ─ */}
          <SectionHeader title={language === 'ja' ? 'AI 機能' : 'AI Features'} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <List sx={{ py: 0 }}>
              <SwitchItem
                icon={<AiIcon />}
                primary={language === 'ja' ? 'AI 要約（Gemini）' : 'AI Summary'}
                checked={expAiSummary}
                onChange={setExpAiSummary}
                chip="β"
              />
              <Collapse in={expAiSummary}>
                <Divider />
                <Box sx={{ px: 2, py: 1.5 }}>
                  <TextField
                    fullWidth size="small"
                    label={language === 'ja' ? 'Gemini API キー' : 'Gemini API Key'}
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    type={showKey ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowKey((v) => !v)} edge="end">
                            {showKey ? <HideIcon sx={{ fontSize: 16 }} /> : <ShowIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Box>
              </Collapse>
              <Divider />
              <SwitchItem
                icon={<FactCheckIcon />}
                primary={language === 'ja' ? 'Gemini ファクトチェック（β）' : 'Fact-Check (β)'}
                checked={expGeminiFactCheck}
                onChange={setExpGeminiFactCheck}
                chip="β"
                disabled={!expAiSummary}
              />
              <Divider />
              <SwitchItem
                icon={<MergeIcon />}
                primary={language === 'ja' ? 'AI 要約 + ナレッジパネル統合（β）' : 'Merged AI Panel (β)'}
                checked={expMergedAiPanel}
                onChange={setExpMergedAiPanel}
                chip="β"
                disabled={!bothAiEnabled}
              />
              <Divider />
              <SwitchItem
                icon={<SummaryIcon />}
                primary={language === 'ja' ? 'AI 検索履歴サマリー（β）' : 'AI History Summary (β)'}
                checked={expAiHistorySummary}
                onChange={setExpAiHistorySummary}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<ExpandIcon />}
                primary={language === 'ja' ? 'クエリ展開（β）' : 'Query Expansion (β)'}
                checked={expQueryExpansion}
                onChange={setExpQueryExpansion}
                chip="β"
              />
            </List>
          </Paper>

          {/* ─ 検索 ─ */}
          <SectionHeader title={language === 'ja' ? '検索機能' : 'Search'} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <List sx={{ py: 0 }}>
              <SwitchItem
                icon={<ImageSearchIcon />}
                primary={t.experimentalImageSearch}
                checked={expImageSearch}
                onChange={setExpImageSearch}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<KnowledgeIcon />}
                primary={language === 'ja' ? 'ナレッジパネル（Wikipedia）' : 'Knowledge Panel'}
                checked={expKnowledgePanel}
                onChange={setExpKnowledgePanel}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<WebIcon />}
                primary={language === 'ja' ? 'ミニブラウザプレビュー（β）' : 'Mini Browser (β)'}
                checked={expMiniBrowser}
                onChange={setExpMiniBrowser}
                chip="β"
              />
              <Divider />
              <SwitchItem
                icon={<SyncAltIcon />}
                primary={language === 'ja' ? 'YouTube代替サーバー転送（β）' : 'YouTube Redirection (β)'}
                checked={expUseInvidious}
                onChange={setExpUseInvidious}
                chip="β"
              />
              <Collapse in={expUseInvidious}>
                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                  <SelectItem
                    icon={<WebIcon />}
                    primary="Instance"
                    value={invidiousInstance}
                    onChange={(v) => setInvidiousInstance(v)}
                  >
                    <MenuItem value="https://inv.nadeko.net/">inv.nadeko.net</MenuItem>
                    <MenuItem value="https://yewtu.be/">yewtu.be</MenuItem>
                    <MenuItem value="https://invidious.nerdvpn.de/">invidious.nerdvpn.de</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </SelectItem>
                </Box>
              </Collapse>
              <Divider />
              {/* ─ Markdown 変換設定（常に表示される入力欄） ─ */}
              <SwitchItem
                icon={<MarkdownIcon />}
                primary={language === 'ja' ? 'ニュースのMarkdown変換（β）' : 'News to Markdown (β)'}
                checked={expNewsMarkdown}
                onChange={setExpNewsMarkdown}
                chip="β"
              />
              <Box sx={{ px: 2, py: 1.5, opacity: expNewsMarkdown ? 1 : 0.5, pointerEvents: expNewsMarkdown ? 'auto' : 'none' }}>
                <TextField
                  fullWidth size="small"
                  label="Markdown API Endpoint"
                  value={markdownApiEndpoint}
                  onChange={(e) => setMarkdownApiEndpoint(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, mb: 1.5 }}
                />
                <SelectItem
                  icon={<MarkdownIcon />}
                  primary="Method"
                  value={markdownApiMethod}
                  onChange={(v) => setMarkdownApiMethod(v as 'POST' | 'GET')}
                >
                  <MenuItem value="POST">POST (JSON)</MenuItem>
                  <MenuItem value="GET">GET (Query Param)</MenuItem>
                </SelectItem>
              </Box>
            </List>
          </Paper>

          {/* ─ データ管理 ─ */}
          <SectionHeader title={language === 'ja' ? 'データ管理' : 'Data'} />
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <List sx={{ py: 0 }}>
              <SwitchItem
                icon={<SyncAltIcon />}
                primary={language === 'ja' ? '設定のエクスポート / インポート' : 'Settings Sync'}
                checked={expSettingsExportImport}
                onChange={setExpSettingsExportImport}
                chip="β"
              />
              <Collapse in={expSettingsExportImport}>
                <Divider />
                <Box sx={{ px: 2, py: 2, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" size="small" onClick={handleExportSettings}>Export</Button>
                  <Button variant="outlined" size="small" component="label">
                    Import <input type="file" hidden accept=".json" onChange={handleImportSettings} />
                  </Button>
                </Box>
              </Collapse>
            </List>
          </Paper>

          <Box sx={{ height: 40 }} />
        </Container>
        <BottomNavSpacer />
      </Box>
      <Snackbar
        open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')}
        message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { borderRadius: '12px', fontSize: '13px' } }}
      />
    </Box>
  );
};

export default Labs;
