import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Link, Skeleton, Chip, useTheme, Divider,
} from '@mui/material';
import { OpenInNewOutlined as OpenIcon, AutoStoriesOutlined as WikiIcon, AccountTreeOutlined as TreeIcon } from '@mui/icons-material';
import { fetchWikiSummary, fetchWikiRelated, WikiSummary } from '../utils/wikipedia';
import { useSearchStore } from '../store/useSearchStore';
import { EASE_SPRING, DUR_NORMAL } from '../utils/motion';

interface Props {
  query: string;
  /** mobile=true のとき横長カードレイアウト */
  mobile?: boolean;
}

const KnowledgePanel: React.FC<Props> = ({ query, mobile = false }) => {
  const language = useSearchStore((s) => s.language);
  const expWikiQuickJump = useSearchStore((s) => s.expWikiQuickJump);
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const [data,    setData]    = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [queried, setQueried] = useState('');
  
  const [related, setRelated] = useState<WikiSummary[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadData = async (q: string) => {
    if (!q || q === queried) return;
    setQueried(q);
    setData(null);
    setLoading(true);
    setExpanded(false);
    setRelated([]);
    const res = await fetchWikiSummary(q, language);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData(query);
  }, [query, language]);

  useEffect(() => {
    if (data && expWikiQuickJump && expanded && related.length === 0) {
      setLoadingRelated(true);
      fetchWikiRelated(data.title, language).then(res => {
        setRelated(res);
        setLoadingRelated(false);
      });
    }
  }, [data, expWikiQuickJump, expanded, language, related.length]);

  if (!loading && !data) return null;

  const cardSx = {
    borderRadius: '16px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    backgroundColor: isDark ? '#14141A' : '#ffffff',
    boxShadow: isDark
      ? '0 2px 12px rgba(0,0,0,0.4)'
      : '0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    transition: `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
    mb: mobile ? { xs: '14px', md: '16px' } : 0,
  };

  if (loading) {
    return (
      <Box sx={cardSx}>
        <Skeleton variant="rectangular" width="100%" height={mobile ? 120 : 160} />
        <Box sx={{ p: '14px 16px' }}>
          <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton width="40%" height={14} sx={{ mb: 1.5 }} />
          <Skeleton width="100%" height={13} />
          <Skeleton width="90%"  height={13} sx={{ mt: 0.5 }} />
          <Skeleton width="70%"  height={13} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    );
  }

  if (!data) return null;

  // 本文を行数制限（モバイル=4行、デスクトップ=全文）
  const extractLines = (mobile || !expanded) ? 4 : undefined;

  return (
    <Box sx={cardSx} className="pm-fade-up">
      {/* サムネイル */}
      {data.thumbnail && (
        <Box
          sx={{
            width: '100%',
            height: mobile ? 140 : 180,
            overflow: 'hidden',
            backgroundColor: isDark ? '#1a1a24' : '#f5f5f5',
          }}
        >
          <Box
            component="img"
            src={data.thumbnail.source}
            alt={data.title}
            sx={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </Box>
      )}

      <Box sx={{ p: '14px 16px' }}>
        {/* タイトル + 説明 */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3, mb: data.description ? '3px' : '8px' }}
        >
          {data.title}
        </Typography>
        {data.description && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '12px', display: 'block', mb: '10px' }}
          >
            {data.description}
          </Typography>
        )}

        <Divider sx={{ mb: '10px', opacity: 0.5 }} />

        {/* 概要文 */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'text.primary',
            ...(extractLines ? {
              display: '-webkit-box',
              WebkitLineClamp: extractLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } : {
              display: 'block',
            }),
          }}
        >
          {data.extract}
        </Typography>

        {/* フッター */}
        <Box sx={{ mt: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<WikiIcon sx={{ fontSize: '13px !important' }} />}
              label="Wikipedia"
              size="small"
              sx={{
                height: 22, fontSize: '11px', fontWeight: 600,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            />
            {expWikiQuickJump && (
              <Typography
                variant="caption"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  fontSize: '11px', color: 'primary.main', cursor: 'pointer', fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {expanded ? (language === 'ja' ? '閉じる' : 'Show less') : (language === 'ja' ? 'もっと見る' : 'Show more')}
              </Typography>
            )}
          </Box>
          <Link
            href={data.pageUrl}
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '12px', color: 'primary.main', fontWeight: 500,
            }}
          >
            {language === 'ja' ? '外部で開く' : 'Open external'}
            <OpenIcon sx={{ fontSize: 13 }} />
          </Link>
        </Box>

        {/* Wikipedia Quick Jump (Related articles) */}
        {expanded && expWikiQuickJump && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1.5, fontWeight: 600 }}>
              <TreeIcon sx={{ fontSize: 14 }} /> {language === 'ja' ? '関連記事 (Wikipedia クイックジャンプ)' : 'Related Articles (Quick Jump)'}
            </Typography>
            {loadingRelated ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton height={36} sx={{ borderRadius: 1 }} />
                <Skeleton height={36} sx={{ borderRadius: 1 }} />
                <Skeleton height={36} sx={{ borderRadius: 1 }} />
              </Box>
            ) : related.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {related.map((rel, i) => (
                  <Box
                    key={i}
                    onClick={() => {
                      setQueried(''); // force refetch
                      loadData(rel.title);
                    }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1,
                      borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid transparent`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderColor: 'divider'
                      }
                    }}
                  >
                    {rel.thumbnail ? (
                      <Box component="img" src={rel.thumbnail.source} sx={{ width: 36, height: 36, borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WikiIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rel.title}
                      </Typography>
                      {rel.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rel.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
               <Typography variant="caption" color="text.disabled">
                 {language === 'ja' ? '関連記事が見つかりません。' : 'No related articles found.'}
               </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KnowledgePanel;
