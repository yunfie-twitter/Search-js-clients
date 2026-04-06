import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, IconButton, Collapse,
  CircularProgress, Tooltip, useTheme, Chip,
} from '@mui/material';
import {
  AutoAwesomeOutlined as SparkleIcon,
  RefreshOutlined as RefreshIcon,
  ExpandLessOutlined as CollapseIcon,
  ExpandMoreOutlined as ExpandIcon,
  ErrorOutlineOutlined as ErrorIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { fetchGeminiSummary, clearSummaryCache } from '../utils/gemini';
import { ResultMeta } from '@yunfie/search-js';
import { EASE_SPRING, DUR_NORMAL } from '../utils/motion';

interface Props {
  query: string;
  results: ResultMeta[];
}

const AiSummaryCard: React.FC<Props> = ({ query, results }) => {
  const geminiApiKey = useSearchStore((s) => s.geminiApiKey);
  const language     = useSearchStore((s) => s.language);
  const theme        = useTheme();
  const isDark       = theme.palette.mode === 'dark';

  const [summary,   setSummary]   = useState<string>('');
  const [error,     setError]     = useState<string>('');
  const [loading,   setLoading]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const prevQueryRef = useRef<string>('');
  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;
    setSummary('');
    setError('');
    setCollapsed(false);
  }, [query]);

  const run = useCallback(async (forceRefresh = false) => {
    if (!query || results.length === 0 || loading) return;
    if (forceRefresh) clearSummaryCache();
    setLoading(true);
    setError('');
    setSummary('');

    const snippets = results
      .slice(0, 8)
      .map((r) => (r as any).summary || (r as any).snippet || r.title || '')
      .filter(Boolean);

    const result = await fetchGeminiSummary(query, snippets, geminiApiKey, language);
    if (result.error) {
      setError(result.error ?? '');
    } else {
      setSummary(result.text ?? '');
    }
    setLoading(false);
  }, [query, results, geminiApiKey, language, loading]);

  useEffect(() => {
    if (results.length > 0 && !summary && !error && !loading) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  if (!summary && !error && !loading) return null;

  return (
    <Box
      sx={{
        mb: { xs: '14px', md: '16px' },
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${
          isDark ? 'rgba(130,120,255,0.25)' : 'rgba(99,102,241,0.2)'
        }`,
        background: isDark
          ? 'linear-gradient(135deg, rgba(30,27,60,0.95) 0%, rgba(20,20,30,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(239,238,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        boxShadow: isDark
          ? '0 2px 16px rgba(99,102,241,0.15)'
          : '0 2px 16px rgba(99,102,241,0.08)',
        transition: `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: '16px', py: '10px',
          display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: collapsed || loading || error
            ? 'none'
            : `1px solid ${isDark ? 'rgba(130,120,255,0.15)' : 'rgba(99,102,241,0.12)'}`,
        }}
      >
        <SparkleIcon sx={{ fontSize: 16, color: isDark ? '#a78bfa' : '#6366f1', flexShrink: 0 }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : '#6366f1', letterSpacing: '0.04em', flexGrow: 1 }}
        >
          {language === 'ja' ? 'AI 要約' : 'AI Summary'}
        </Typography>
        <Chip
          label={language === 'ja' ? '実験的' : 'Experimental'}
          size="small"
          sx={{
            height: 18, fontSize: '10px', fontWeight: 600,
            bgcolor: isDark ? 'rgba(250,200,90,0.15)' : 'rgba(245,158,11,0.12)',
            color: isDark ? '#fbbf24' : '#b45309',
            border: `1px solid ${isDark ? 'rgba(250,200,90,0.3)' : 'rgba(245,158,11,0.3)'}`,
            mr: 0.5,
          }}
        />
        {!loading && (summary || error) && (
          <Tooltip title={language === 'ja' ? '再生成' : 'Regenerate'}>
            <IconButton size="small" onClick={() => run(true)} sx={{ p: '3px', color: 'text.secondary' }}>
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
        {!loading && summary && (
          <Tooltip title={collapsed
            ? (language === 'ja' ? '展開' : 'Expand')
            : (language === 'ja' ? '折りたたむ' : 'Collapse')
          }>
            <IconButton size="small" onClick={() => setCollapsed((c) => !c)} sx={{ p: '3px', color: 'text.secondary' }}>
              {collapsed ? <ExpandIcon sx={{ fontSize: 14 }} /> : <CollapseIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Body */}
      {loading && (
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={14} sx={{ color: isDark ? '#a78bfa' : '#6366f1' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {language === 'ja' ? '要約を生成中…' : 'Generating summary…'}
          </Typography>
        </Box>
      )}

      {error && !loading && (
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <ErrorIcon sx={{ fontSize: 15, color: 'error.main', mt: '1px', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: 'error.main', lineHeight: 1.6 }}>
            {error}
          </Typography>
        </Box>
      )}

      {summary && !loading && (
        <Collapse in={!collapsed}>
          <Box sx={{ px: '16px', py: '12px' }}>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.75,
                fontSize: { xs: '13px', md: '14px' },
                color: 'text.primary',
                whiteSpace: 'pre-wrap',
              }}
            >
              {summary}
            </Typography>
          </Box>

          {/* Disclaimer */}
          <Box
            sx={{
              px: '16px', pb: '10px',
              display: 'flex', alignItems: 'flex-start', gap: '5px',
              borderTop: `1px solid ${isDark ? 'rgba(130,120,255,0.10)' : 'rgba(99,102,241,0.08)'}`,
              pt: '8px',
            }}
          >
            <InfoIcon sx={{ fontSize: 11, color: 'text.disabled', mt: '1px', flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{ fontSize: '10px', color: 'text.disabled', lineHeight: 1.5 }}
            >
              {language === 'ja'
                ? 'AIは不正確な情報を表示することがあります。生成された回答を必ず再確認してください。'
                : 'AI may display inaccurate information. Please verify generated responses.'}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default AiSummaryCard;
