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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';

const Labs: React.FC = () => {
  const navigate = useNavigate();
  const language              = useSearchStore((s) => s.language);
  const expImageSearch        = useSearchStore((s) => s.expImageSearch);
  const setExpImageSearch     = useSearchStore((s) => s.setExpImageSearch);
  const expLenis              = useSearchStore((s) => s.expLenis);
  const setExpLenis           = useSearchStore((s) => s.setExpLenis);
  const expAiSummary          = useSearchStore((s) => s.expAiSummary);
  const setExpAiSummary       = useSearchStore((s) => s.setExpAiSummary);
  const expKnowledgePanel     = useSearchStore((s) => s.expKnowledgePanel);
  const setExpKnowledgePanel  = useSearchStore((s) => s.setExpKnowledgePanel);
  const geminiApiKey          = useSearchStore((s) => s.geminiApiKey);
  const setGeminiApiKey       = useSearchStore((s) => s.setGeminiApiKey);
  const t = React.useMemo(() => translations[language], [language]);

  const [expInstantResults, setExpInstantResults] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleBack = () => { triggerHaptic(); navigate(-1); };

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
                fullWidth
                size="small"
                label={language === 'ja' ? 'Gemini API キー' : 'Gemini API Key'}
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
                        {showKey
                          ? <HideIcon sx={{ fontSize: 16 }} />
                          : <ShowIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                  '& .MuiInputLabel-root': { fontSize: '13px' },
                }}
                helperText={
                  language === 'ja'
                    ? 'キーはこのデバイスのローカルストレージにのみ保存されます。'
                    : "Your key is stored only in this device's local storage."
                }
              />
            </Box>
          </Collapse>
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
