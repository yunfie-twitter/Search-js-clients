import React, { useState } from 'react';
import {
  Box, Container, Typography, List,
  IconButton, Divider, Paper, Alert,
  TextField, InputAdornment, Collapse,
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  ScienceOutlined  as ScienceIcon,
  ImageSearchOutlined as ImageSearchIcon,
  SpeedOutlined    as LenisIcon,
  WarningAmberOutlined as WarningIcon,
  AutoAwesomeOutlined as AiIcon,
  KeyOutlined as KeyIcon,
  VisibilityOutlined as ShowIcon,
  VisibilityOffOutlined as HideIcon,
  TravelExploreOutlined as KnowledgeIcon,
  FactCheckOutlined as FactCheckIcon,
  MergeOutlined as MergeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';

const Labs: React.FC = () => {
  const navigate = useNavigate();
  const language                  = useSearchStore((s) => s.language);
  const expImageSearch            = useSearchStore((s) => s.expImageSearch);
  const setExpImageSearch         = useSearchStore((s) => s.setExpImageSearch);
  const expLenis                  = useSearchStore((s) => s.expLenis);
  const setExpLenis               = useSearchStore((s) => s.setExpLenis);
  const expAiSummary              = useSearchStore((s) => s.expAiSummary);
  const setExpAiSummary           = useSearchStore((s) => s.setExpAiSummary);
  const expKnowledgePanel         = useSearchStore((s) => s.expKnowledgePanel);
  const setExpKnowledgePanel      = useSearchStore((s) => s.setExpKnowledgePanel);
  const expGeminiFactCheck        = useSearchStore((s) => s.expGeminiFactCheck);
  const setExpGeminiFactCheck     = useSearchStore((s) => s.setExpGeminiFactCheck);
  const expMergedAiPanel          = useSearchStore((s) => s.expMergedAiPanel);
  const setExpMergedAiPanel       = useSearchStore((s) => s.setExpMergedAiPanel);
  const geminiApiKey              = useSearchStore((s) => s.geminiApiKey);
  const setGeminiApiKey           = useSearchStore((s) => s.setGeminiApiKey);
  const geminiFactCheckApiKey     = useSearchStore((s) => s.geminiFactCheckApiKey);
  const setGeminiFactCheckApiKey  = useSearchStore((s) => s.setGeminiFactCheckApiKey);
  const t = React.useMemo(() => translations[language], [language]);

  const [expInstantResults, setExpInstantResults] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showFcKey, setShowFcKey] = useState(false);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

  const bothAiEnabled = expAiSummary && expKnowledgePanel;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        pt: 'calc(env(safe-area-inset-top) + 16px)',
        display: 'flex', alignItems: 'center',
        backgroundColor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: 'warning.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t.sectionExperimental}
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ py: 2, pb: 8, flexGrow: 1 }}>
        <Alert severity="warning" icon={<WarningIcon />}
          sx={{ mb: 2, borderRadius: '12px', fontSize: '13px' }}>
          {t.experimentalNote}
        </Alert>

        {/* ─ スクロール ─ */}
        <SectionHeader title={language === 'ja' ? 'スクロール' : 'Scroll'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<LenisIcon />}
              primary={language === 'ja' ? 'Lenis 慣性スクロール（β）' : 'Lenis Inertia Scroll (β)'}
              secondary={language === 'ja'
                ? 'lenis.js による滑らかな慣性スクロール。'
                : 'Smooth inertia scrolling powered by lenis.js.'}
              checked={expLenis}
              onChange={setExpLenis}
              chip="β"
            />
          </List>
        </Paper>

        {/* ─ AI ─ */}
        <SectionHeader title={language === 'ja' ? 'AI 機能' : 'AI Features'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <List sx={{ py: 0 }}>
            {/* AI 要約 */}
            <SwitchItem
              icon={<AiIcon />}
              primary={language === 'ja' ? 'AI 要約（Gemini 3.1 Flash Lite）' : 'AI Summary (Gemini 3.1 Flash Lite)'}
              secondary={language === 'ja'
                ? 'gemini-3.1-flash-lite-preview で検索結果を要約表示。APIキーが必要です。'
                : 'Summarize results via gemini-3.1-flash-lite-preview. Requires your API key.'}
              checked={expAiSummary}
              onChange={setExpAiSummary}
              chip="β"
            />
          </List>
          <Collapse in={expAiSummary}>
            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField
                fullWidth size="small"
                label={language === 'ja' ? 'Gemini API キー（要約用）' : 'Gemini API Key (Summary)'}
                placeholder="AIza..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                type={showKey ? 'text' : 'password'}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowKey((v) => !v)} edge="end">
                        {showKey ? <HideIcon sx={{ fontSize: 16 }} /> : <ShowIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiInputLabel-root': { fontSize: '13px' } }}
                helperText={
                  language === 'ja'
                    ? 'キーはこのデバイスのローカルストレージにのみ保存されます。'
                    : "Your key is stored only in this device's local storage."
                }
              />
            </Box>
          </Collapse>

          {/* Gemini ファクトチェック */}
          <Divider />
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<FactCheckIcon />}
              primary={language === 'ja' ? 'Gemini ファクトチェック（β）' : 'Gemini Fact-Check (β)'}
              secondary={language === 'ja'
                ? 'AI要約の内容をGeminiで検証します。問題なければそのまま、誤りがあれば修正版を表示。AI要約が有効な場合のみ機能します。'
                : 'Verify AI summary with Gemini. Shows original if OK, or corrected version if issues are found. Requires AI Summary to be enabled.'}
              checked={expGeminiFactCheck}
              onChange={setExpGeminiFactCheck}
              chip="β"
              disabled={!expAiSummary}
            />
          </List>
          <Collapse in={expGeminiFactCheck && expAiSummary}>
            <Divider />
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField
                fullWidth size="small"
                label={language === 'ja' ? 'ファクトチェック用 API キー（省略可）' : 'Fact-Check API Key (optional)'}
                placeholder="AIza..."
                value={geminiFactCheckApiKey}
                onChange={(e) => setGeminiFactCheckApiKey(e.target.value)}
                type={showFcKey ? 'text' : 'password'}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowFcKey((v) => !v)} edge="end">
                        {showFcKey ? <HideIcon sx={{ fontSize: 16 }} /> : <ShowIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiInputLabel-root': { fontSize: '13px' } }}
                helperText={
                  language === 'ja'
                    ? '空欄の場合は要約用APIキーを共用します。キーはローカルストレージにのみ保存されます。'
                    : "If empty, the summary API key will be reused. Stored only in local storage."
                }
              />
            </Box>
          </Collapse>

          {/* AI 要約 + ナレッジパネル 統合表示 */}
          <Divider />
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<MergeIcon />}
              primary={language === 'ja' ? 'AI 要約 + ナレッジパネル 統合表示（β）' : 'Merged AI Summary + Knowledge Panel (β)'}
              secondary={language === 'ja'
                ? 'AI要約とWikipediaナレッジを1枚のカードにまとめて表示します。AI要約・ナレッジパネルの両方が有効な場合のみ機能します。'
                : 'Combines AI summary and Wikipedia knowledge into a single card. Requires both AI Summary and Knowledge Panel to be enabled.'}
              checked={expMergedAiPanel}
              onChange={setExpMergedAiPanel}
              chip="β"
              disabled={!bothAiEnabled}
            />
          </List>
          {!bothAiEnabled && expMergedAiPanel && (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Alert severity="info" sx={{ borderRadius: '10px', fontSize: '12px', py: '4px' }}>
                {language === 'ja'
                  ? 'AI要約とナレッジパネルを両方有効にしてください。'
                  : 'Please enable both AI Summary and Knowledge Panel.'}
              </Alert>
            </Box>
          )}
        </Paper>

        {/* ─ 検索 ─ */}
        <SectionHeader title={language === 'ja' ? '検索機能' : 'Search'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<ImageSearchIcon />}
              primary={t.experimentalImageSearch}
              secondary={t.experimentalImageSearchDesc}
              checked={expImageSearch}
              onChange={setExpImageSearch}
              chip="β"
            />
            <Divider />
            <SwitchItem
              icon={<KnowledgeIcon />}
              primary={language === 'ja' ? 'ナレッジパネル（Wikipedia）' : 'Knowledge Panel (Wikipedia)'}
              secondary={language === 'ja'
                ? 'クエリに関連する Wikipedia の概要をサイドバー／カードで表示します。'
                : 'Shows a Wikipedia summary card in the sidebar or above results.'}
              checked={expKnowledgePanel}
              onChange={setExpKnowledgePanel}
              chip="β"
            />
          </List>
        </Paper>

        {/* ─ 開発中（無効）─ */}
        <SectionHeader title={language === 'ja' ? '開発中' : 'Coming Soon'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem
              icon={<ScienceIcon />}
              primary={t.experimentalInstantResults}
              secondary={t.experimentalInstantResultsDesc}
              checked={expInstantResults}
              onChange={setExpInstantResults}
              chip="β" disabled
            />
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Labs;
