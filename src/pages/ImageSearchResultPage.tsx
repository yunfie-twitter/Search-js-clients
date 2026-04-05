import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, Tooltip,
  ImageList, ImageListItem, ImageListItemBar,
  useTheme, useMediaQuery,
} from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  OpenInNewOutlined as OpenInNewIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { BottomNavSpacer } from '../components/MobileBottomNav';
import type { FaissImageResult } from '../components/ImageSearch';

const FAISS_BASE = 'https://faiss.wholphin.net';

const ImageSearchResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark   = theme.palette.mode === 'dark';
  const language = useSearchStore((s) => s.language);
  const t = React.useMemo(() => translations[language], [language]);

  const state = location.state as { results?: FaissImageResult[]; previewSrc?: string } | null;
  const results   = state?.results   ?? [];
  const previewSrc = state?.previewSrc ?? null;

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      paddingTop: 'env(safe-area-inset-top)',
      backgroundColor: 'background.default',
    }}>
      {/* ── ヘッダー ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.5,
        borderBottom: `1px solid ${
          isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
        }`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: isDark ? 'rgba(10,10,14,0.85)' : 'rgba(255,255,255,0.85)',
      }}>
        <IconButton size="small" onClick={() => navigate(-1)}
          sx={{ mr: 0.5, borderRadius: '10px' }}>
          <BackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 650, fontSize: '16px', letterSpacing: '-0.01em', flex: 1 }}>
          {language === 'ja' ? '類似画像の検索結果' : 'Similar image results'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {results.length > 0
            ? (language === 'ja' ? `${results.length} 件` : `${results.length} results`)
            : ''}
        </Typography>
      </Box>

      {/* ── コンテンツ ── */}
      <Box sx={{ flex: 1, px: { xs: 1.5, sm: 3 }, pt: 2, pb: 2 }}>

        {/* クエリ画像プレビュー */}
        {previewSrc && (
          <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img" src={previewSrc} alt="query"
              sx={{
                width: 72, height: 72, borderRadius: '12px',
                objectFit: 'cover',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                }`,
                flexShrink: 0,
              }}
            />
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                {language === 'ja' ? '検索した画像' : 'Query image'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {language === 'ja'
                  ? `${FAISS_BASE} のインデックスで検索`
                  : `Searched in ${FAISS_BASE} index`}
              </Typography>
            </Box>
          </Box>
        )}

        {results.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: '15px' }}>
              {language === 'ja' ? '結果がありません' : 'No results found'}
            </Typography>
          </Box>
        ) : (
          <ImageList
            variant="masonry"
            cols={isMobile ? 2 : 3}
            gap={isMobile ? 6 : 10}
            sx={{ mt: 0 }}
          >
            {results.map((item, i) => (
              <ImageListItem key={item.id ?? i}>
                <img
                  src={item.url}
                  alt={item.title ?? ''}
                  loading="lazy"
                  style={{ borderRadius: 8, width: '100%', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <ImageListItemBar
                  title={item.title}
                  subtitle={
                    <>
                      {item.score != null && (
                        <span style={{ fontSize: '10px' }}>score: {item.score.toFixed(3)}</span>
                      )}
                      <span style={{ fontSize: '10px', display: 'block', opacity: 0.7 }}>
                        {FAISS_BASE}
                      </span>
                    </>
                  }
                  actionIcon={
                    item.url ? (
                      <Tooltip title={t.visitWebsite}>
                        <IconButton size="small" component="a" href={item.url}
                          target="_blank" rel="noopener"
                          sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : undefined
                  }
                  sx={{ borderRadius: '0 0 8px 8px' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>

      <BottomNavSpacer />
    </Box>
  );
};

export default ImageSearchResultPage;
