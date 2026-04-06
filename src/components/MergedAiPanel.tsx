import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, IconButton, Collapse,
  CircularProgress, Tooltip, useTheme, Chip,
  Divider, Link, Skeleton,
} from '@mui/material';
import {
  AutoAwesomeOutlined as SparkleIcon,
  RefreshOutlined as RefreshIcon,
  ExpandLessOutlined as CollapseIcon,
  ExpandMoreOutlined as ExpandIcon,
  ErrorOutlineOutlined as ErrorIcon,
  InfoOutlined as InfoIcon,
  FactCheckOutlined as FactCheckIcon,
  CheckCircleOutlined as CheckOkIcon,
  WarningAmberOutlined as WarningIcon,
  AutoStoriesOutlined as WikiIcon,
  OpenInNewOutlined as OpenIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { fetchGeminiSummary, fetchGeminiFactCheck, clearSummaryCache } from '../utils/gemini';
import { fetchWikiSummary, WikiSummary } from '../utils/wikipedia';
import { ResultMeta } from '@yunfie/search-js';
import { EASE_SPRING, DUR_NORMAL } from '../utils/motion';

interface Props {
  query: string;
  results: ResultMeta[];
}

type FactCheckStatus = 'idle' | 'checking' | 'ok' | 'corrected' | 'error';

const MergedAiPanel: React.FC<Props> = ({ query, results }) => {
  const geminiApiKey          = useSearchStore((s) => s.geminiApiKey);
  const expGeminiFactCheck    = useSearchStore((s) => s.expGeminiFactCheck);
  const geminiFactCheckApiKey = useSearchStore((s) => s.geminiFactCheckApiKey);
  const language              = useSearchStore((s) => s.language);
  const theme                 = useTheme();
  const isDark                = theme.palette.mode === 'dark';

  // AI 要約
  const [summary,         setSummary]         = useState<string>('');
  const [summaryError,    setSummaryError]     = useState<string>('');
  const [summaryLoading,  setSummaryLoading]   = useState(false);
  const [collapsed,       setCollapsed]        = useState(false);
  const [factCheckStatus, setFactCheckStatus]  = useState<FactCheckStatus>('idle');
  const [correctedText,   setCorrectedText]    = useState<string>('');

  // Wikipedia
  const [wiki,        setWiki]        = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiQueried, setWikiQueried] = useState('');
  const [wikiExpanded, setWikiExpanded] = useState(false);

  const prevQueryRef = useRef<string>('');

  // クエリが変わったらリセット
  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;
    setSummary('');
    setSummaryError('');
    setCollapsed(false);
    setFactCheckStatus('idle');
    setCorrectedText('');
    setWikiExpanded(false);
  }, [query]);

  // Wikipedia 取得
  useEffect(() => {
    if (!query || query === wikiQueried) return;
    setWikiQueried(query);
    setWiki(null);
    setWikiLoading(true);
    fetchWikiSummary(query, language).then((res) => {
      setWiki(res);
      setWikiLoading(false);
    });
  }, [query, language, wikiQueried]);

  // ファクトチェック
  const runFactCheck = useCallback(async (text: string, snippets: string[]) => {
    if (!expGeminiFactCheck) return;
    const fcKey = geminiFactCheckApiKey || geminiApiKey;
    if (!fcKey) return;
    setFactCheckStatus('checking');
    const result = await fetchGeminiFactCheck(text, query, snippets, fcKey, language);
    if (result.ok) {
      setFactCheckStatus(result.error ? 'error' : 'ok');
    } else {
      setCorrectedText(result.corrected ?? text);
      setFactCheckStatus('corrected');
    }
  }, [expGeminiFactCheck, geminiFactCheckApiKey, geminiApiKey, query, language]);

  // AI 要約実行
  const run = useCallback(async (forceRefresh = false) => {
    if (!query || results.length === 0 || summaryLoading) return;
    if (forceRefresh) clearSummaryCache();
    setSummaryLoading(true);
    setSummaryError('');
    setSummary('');
    setFactCheckStatus('idle');
    setCorrectedText('');

    const snippets = results
      .slice(0, 8)
      .map((r) => (r as any).summary || (r as any).snippet || r.title || '')
      .filter(Boolean);

    const result = await fetchGeminiSummary(query, snippets, geminiApiKey, language);
    if (result.error) {
      setSummaryError(result.error ?? '');
    } else {
      const text = result.text ?? '';
      setSummary(text);
      await runFactCheck(text, snippets);
    }
    setSummaryLoading(false);
  }, [query, results, geminiApiKey, language, summaryLoading, runFactCheck]);

  useEffect(() => {
    if (results.length > 0 && !summary && !summaryError && !summaryLoading) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const displayText   = factCheckStatus === 'corrected' ? correctedText : summary;
  const hasContent    = summaryLoading || summary || summaryError || wikiLoading || wiki;
  if (!hasContent) return null;

  // アクセントカラー
  const accent     = isDark ? '#a78bfa' : '#6366f1';
  const accentBg   = isDark ? 'rgba(30,27,60,0.95)' : 'rgba(239,238,255,0.9)';
  const accentBg2  = isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.95)';
  const borderCol  = isDark ? 'rgba(130,120,255,0.25)' : 'rgba(99,102,241,0.2)';

  return (
    <Box
      sx={{
        mb: { xs: '14px', md: '16px' },
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${borderCol}`,
        background: `linear-gradient(135deg, ${accentBg} 0%, ${accentBg2} 100%)`,
        boxShadow: isDark
          ? '0 2px 16px rgba(99,102,241,0.15)'
          : '0 2px 16px rgba(99,102,241,0.08)',
        transition: `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
      }}
    >
      {/* ══ ヘッダー ══ */}
      <Box
        sx={{
          px: '16px', py: '10px',
          display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: collapsed
            ? 'none'
            : `1px solid ${isDark ? 'rgba(130,120,255,0.15)' : 'rgba(99,102,241,0.12)'}`,
        }}
      >
        <SparkleIcon sx={{ fontSize: 16, color: accent, flexShrink: 0 }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: accent, letterSpacing: '0.04em', flexGrow: 1 }}
        >
          {language === 'ja' ? 'AI 要約 + ナレッジ' : 'AI Summary + Knowledge'}
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

        {/* ファクトチェックバッジ */}
        {expGeminiFactCheck && factCheckStatus === 'checking' && (
          <Tooltip title={language === 'ja' ? 'ファクトチェック中…' : 'Fact-checking…'}>
            <CircularProgress size={12} sx={{ color: isDark ? '#6ee7b7' : '#059669', mr: 0.5 }} />
          </Tooltip>
        )}
        {expGeminiFactCheck && factCheckStatus === 'ok' && (
          <Tooltip title={language === 'ja' ? 'ファクトチェック: 問題なし' : 'Fact-check: OK'}>
            <CheckOkIcon sx={{ fontSize: 15, color: isDark ? '#6ee7b7' : '#059669' }} />
          </Tooltip>
        )}
        {expGeminiFactCheck && factCheckStatus === 'corrected' && (
          <Tooltip title={language === 'ja' ? 'ファクトチェック: 修正されました' : 'Fact-check: Corrected'}>
            <WarningIcon sx={{ fontSize: 15, color: isDark ? '#fbbf24' : '#d97706' }} />
          </Tooltip>
        )}

        {!summaryLoading && (summary || summaryError) && (
          <Tooltip title={language === 'ja' ? '再生成' : 'Regenerate'}>
            <IconButton size="small" onClick={() => run(true)} sx={{ p: '3px', color: 'text.secondary' }}>
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
        {!summaryLoading && (summary || wiki) && (
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

      {/* ══ ボディ ══ */}
      <Collapse in={!collapsed}>
        {/* Wikipedia サムネイル */}
        {!wikiLoading && wiki?.thumbnail && (
          <Box
            sx={{
              width: '100%', height: { xs: 120, md: 160 },
              overflow: 'hidden',
              backgroundColor: isDark ? '#1a1a24' : '#f0f0f8',
            }}
          >
            <Box
              component="img"
              src={wiki.thumbnail.source}
              alt={wiki.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          </Box>
        )}
        {wikiLoading && (
          <Skeleton variant="rectangular" width="100%" height={140} />
        )}

        {/* ── AI 要約セクション ── */}
        <Box sx={{ px: '16px', pt: '12px' }}>
          {/* ローディング */}
          {summaryLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: '10px' }}>
              <CircularProgress size={14} sx={{ color: accent }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {language === 'ja' ? '要約を生成中…' : 'Generating summary…'}
              </Typography>
            </Box>
          )}

          {/* エラー */}
          {summaryError && !summaryLoading && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: '10px' }}>
              <ErrorIcon sx={{ fontSize: 15, color: 'error.main', mt: '1px', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'error.main', lineHeight: 1.6 }}>
                {summaryError}
              </Typography>
            </Box>
          )}

          {/* ファクトチェック修正バナー */}
          {expGeminiFactCheck && factCheckStatus === 'corrected' && (
            <Box
              sx={{
                mb: '8px', px: '10px', py: '5px',
                borderRadius: '8px',
                display: 'flex', alignItems: 'flex-start', gap: '6px',
                bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(245,158,11,0.10)',
                border: `1px solid ${isDark ? 'rgba(251,191,36,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}
            >
              <FactCheckIcon sx={{ fontSize: 13, color: isDark ? '#fbbf24' : '#d97706', mt: '1px', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontSize: '11px', color: isDark ? '#fbbf24' : '#92400e', lineHeight: 1.5 }}>
                {language === 'ja'
                  ? 'ファクトチェックにより内容が修正されました。'
                  : 'Content was corrected by fact-checking.'}
              </Typography>
            </Box>
          )}

          {/* 要約テキスト */}
          {displayText && !summaryLoading && (
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.75,
                fontSize: { xs: '13px', md: '14px' },
                color: 'text.primary',
                whiteSpace: 'pre-wrap',
                mb: '10px',
              }}
            >
              {displayText}
            </Typography>
          )}
        </Box>

        {/* ── Wikipedia セクション ── */}
        {(wikiLoading || wiki) && (
          <>
            <Divider sx={{ mx: '16px', opacity: 0.5 }} />
            <Box sx={{ px: '16px', pt: '10px', pb: '4px' }}>
              {wikiLoading ? (
                <>
                  <Skeleton width="50%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton width="35%" height={13} sx={{ mb: 1 }} />
                  <Skeleton width="100%" height={13} />
                  <Skeleton width="80%" height={13} sx={{ mt: 0.5 }} />
                </>
              ) : wiki ? (
                <>
                  {/* Wiki タイトル行 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: '4px' }}>
                    <WikiIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '12px', color: 'text.secondary', flexGrow: 1 }}>
                      {wiki.title}
                    </Typography>
                    {wiki.description && (
                      <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.disabled' }}>
                        {wiki.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Wiki 本文（折りたたみ） */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '13px', lineHeight: 1.65, color: 'text.secondary',
                      ...(!wikiExpanded ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      } : {}),
                    }}
                  >
                    {wiki.extract}
                  </Typography>

                  {/* もっと見る / 閉じる */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '8px', mb: '4px' }}>
                    <Typography
                      variant="caption"
                      onClick={() => setWikiExpanded((v) => !v)}
                      sx={{
                        fontSize: '11px', color: accent, cursor: 'pointer', fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {wikiExpanded
                        ? (language === 'ja' ? '閉じる' : 'Show less')
                        : (language === 'ja' ? 'もっと見る' : 'Show more')}
                    </Typography>
                    <Link
                      href={wiki.pageUrl}
                      target="_blank" rel="noopener"
                      underline="hover"
                      sx={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: accent, fontWeight: 500 }}
                    >
                      Wikipedia
                      <OpenIcon sx={{ fontSize: 11 }} />
                    </Link>
                  </Box>
                </>
              ) : null}
            </Box>
          </>
        )}

        {/* ── フッター免責 ── */}
        <Box
          sx={{
            px: '16px', pb: '10px',
            display: 'flex', alignItems: 'flex-start', gap: '5px',
            borderTop: `1px solid ${isDark ? 'rgba(130,120,255,0.10)' : 'rgba(99,102,241,0.08)'}`,
            pt: '8px',
            mt: '4px',
          }}
        >
          <InfoIcon sx={{ fontSize: 11, color: 'text.disabled', mt: '1px', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.disabled', lineHeight: 1.5 }}>
            {language === 'ja'
              ? 'AIは不正確な情報を表示することがあります。Wikipedia情報はCC BY-SA 4.0ライセンスです。'
              : 'AI may display inaccurate information. Wikipedia content is licensed under CC BY-SA 4.0.'}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default MergedAiPanel;
