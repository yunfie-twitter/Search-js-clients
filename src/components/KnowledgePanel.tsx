import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Link, Skeleton, Chip, useTheme, Divider,
} from '@mui/material';
import { OpenInNewOutlined as OpenIcon, AutoStoriesOutlined as WikiIcon } from '@mui/icons-material';
import { fetchWikiSummary, WikiSummary } from '../utils/wikipedia';
import { useSearchStore } from '../store/useSearchStore';
import { EASE_SPRING, DUR_NORMAL } from '../utils/motion';

interface Props {
  query: string;
  /** mobile=true のとき横長カードレイアウト */
  mobile?: boolean;
}

const KnowledgePanel: React.FC<Props> = ({ query, mobile = false }) => {
  const language = useSearchStore((s) => s.language);
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const [data,    setData]    = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [queried, setQueried] = useState('');

  useEffect(() => {
    if (!query || query === queried) return;
    setQueried(query);
    setData(null);
    setLoading(true);
    fetchWikiSummary(query, language).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [query, language, queried]);

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
  const extractLines = mobile ? 4 : undefined;

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
            } : {}),
          }}
        >
          {data.extract}
        </Typography>

        {/* フッター */}
        <Box sx={{ mt: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {language === 'ja' ? 'もっと見る' : 'Read more'}
            <OpenIcon sx={{ fontSize: 13 }} />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default KnowledgePanel;
