import React, { useState, useCallback, memo } from 'react';
import {
  Box, Typography, Link as MuiLink, Skeleton,
  Dialog, DialogTitle, DialogContent, IconButton,
  Button, Pagination, useMediaQuery, useTheme,
  Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  BookmarkBorderOutlined as SaveIcon,
  ShareOutlined as ShareIcon,
  ContentCopyOutlined as CopyIcon,
  OpenInNewOutlined as OpenNewIcon,
  AutoAwesomeOutlined as AiIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { ResultMeta, ResultDetail, fetchDetail } from '@yunfie/search-js';
import translations from '../translations';
import RelatedSearchesCard from './RelatedSearchesCard';
import MediaCard from './MediaCard';
import ItemBreadcrumbURL from './ItemBreadcrumbURL';
import AiSummaryCard from './AiSummaryCard';
import KnowledgePanel from './KnowledgePanel';
import MergedAiPanel from './MergedAiPanel';
import { EASE_SPRING, DUR_NORMAL, DUR_MODAL, staggerDelay } from '../utils/motion';

const GRID_SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);
const LIST_SKELETON_KEYS = Array.from({ length: 5  }, (_, i) => i);

// ─── Result Action Menu ────────────────────────────────────────────
interface ActionMenuProps { item: ResultMeta; onToast: (msg: string) => void; }
const ResultActionMenu: React.FC<ActionMenuProps> = memo(({ item, onToast }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const handleCopy    = () => { navigator.clipboard.writeText(item.url || '').then(() => onToast('URLをコピーしました')); setAnchor(null); };
  const handleShare   = async () => {
    if (navigator.share) { await navigator.share({ title: item.title || '', url: item.url || '' }); }
    else { navigator.clipboard.writeText(item.url || ''); onToast('URLをコピーしました'); }
    setAnchor(null);
  };
  const handleOpenNew = () => { window.open(item.url, '_blank', 'noopener'); setAnchor(null); };
  const handleSave    = () => { onToast('保存しました（未実装）'); setAnchor(null); };
  const handleAI      = () => { onToast('AI要約（未実装）'); setAnchor(null); };

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{
          opacity: 0,
          '.pm-result-card:hover &': { opacity: 1 },
          transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}, transform 120ms ${EASE_SPRING}`,
          '&:active': { transform: 'scale(0.88)' },
          color: 'text.secondary', p: '4px', ml: 'auto', flexShrink: 0,
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={anchor} open={open} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: '14px', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', overflow: 'hidden' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {[
          { label: '保存',         Icon: SaveIcon,    action: handleSave },
          { label: '共有',         Icon: ShareIcon,   action: handleShare },
          { label: 'URLをコピー', Icon: CopyIcon,    action: handleCopy },
          { label: '新規タブ',    Icon: OpenNewIcon, action: handleOpenNew },
          { label: 'AI要約',      Icon: AiIcon,      action: handleAI },
        ].map(({ label, Icon, action }) => (
          <MenuItem key={label} onClick={action} sx={{ py: '10px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 32 }}><Icon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

// ─── Result Card ────────────────────────────────────────────────
const ResultItem: React.FC<{ item: ResultMeta; query: string; type: string; index: number; onToast: (m: string) => void }> = memo(
  ({ item, query, type, index, onToast }) => {
    const setSelectedItem = useSearchStore((s) => s.setSelectedItem);
    const theme  = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleOpenPreview = useCallback(async (e: React.MouseEvent) => {
      if (type === 'web') return;
      e.preventDefault();
      const detail = await fetchDetail({ q: query }, item._idx);
      setSelectedItem(detail);
    }, [type, query, item._idx, setSelectedItem]);

    return (
      <Box
        className="pm-result-card pm-fade-up"
        sx={{
          mb: { xs: '14px', md: '16px' },
          p:  { xs: '14px 16px', md: '16px 18px' },
          borderRadius: '16px',
          backgroundColor: isDark ? '#14141A' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: isDark
            ? '0 1px 4px rgba(0,0,0,0.4)'
            : '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
          transition: `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}, transform 120ms ease-out`,
          '@media (hover: hover)': {
            '&:hover': {
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.09)',
              transform: 'translateY(-1px)',
            },
          },
          '@media (pointer: coarse)': {
            '&:active': { transform: 'scale(0.985)', transition: 'transform 120ms ease-out' },
          },
          '&:active': { transform: 'scale(0.985)' },
          animationDelay: staggerDelay(index, 25),
          width: '100%', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ItemBreadcrumbURL url={item.url || ''} favicon={(item as any).favicon} />
          <ResultActionMenu item={item} onToast={onToast} />
        </Box>
        <MuiLink
          href={item.url} target="_blank" rel="noopener"
          className="selectable" color="primary"
          sx={{
            textDecoration: 'none',
            fontSize: { xs: '16px', md: '18px' },
            fontWeight: 650, letterSpacing: '-0.01em',
            display: '-webkit-box',
            mt: '6px', mb: '6px',
            wordBreak: 'break-word',
            '&:hover': { textDecoration: 'underline', opacity: 0.85 },
            transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
            overflow: 'hidden', textOverflow: 'ellipsis',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.45,
          }}
          onClick={handleOpenPreview}
        >
          {item.title}
        </MuiLink>
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.55, fontSize: { xs: '13px', md: '14px' },
            color: 'text.secondary',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}
        >
          {(item as any).summary || (item as any).snippet || ''}
        </Typography>
      </Box>
    );
  }
);

// ─── Shimmer skeleton ──────────────────────────────────────────────
const LoadingSkeleton = memo(({ index, isDark }: { index: number; isDark: boolean }) => (
  <Box
    sx={{
      mb: '14px', p: '16px 18px', borderRadius: '16px',
      backgroundColor: isDark ? '#14141A' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      animationDelay: staggerDelay(index, 60),
    }}
    className="pm-fade-up"
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: '8px' }}>
      <Box className="pm-skeleton" sx={{ width: 14, height: 14, borderRadius: '3px', flexShrink: 0 }} />
      <Box className="pm-skeleton" sx={{ width: '35%', height: 12 }} />
    </Box>
    <Box className="pm-skeleton" sx={{ width: '85%', height: 20, mb: '6px' }} />
    <Box className="pm-skeleton" sx={{ width: '100%', height: 14 }} />
    <Box className="pm-skeleton" sx={{ width: '70%',  height: 14, mt: '4px' }} />
  </Box>
));

// ─── PreviewDialog ───────────────────────────────────────────────────────
const PreviewDialog: React.FC<any> = ({ selectedItem, setSelectedItem, t }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark   = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={!!selectedItem} onClose={() => setSelectedItem(null)}
      maxWidth="md" fullWidth fullScreen={isMobile}
      TransitionProps={{ timeout: { enter: 360, exit: 200 } }}
      PaperProps={{
        className: 'pm-modal',
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          backgroundColor: isDark ? 'rgba(20,20,26,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
      }}
      slotProps={{ backdrop: { sx: {
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
        transition: `opacity ${DUR_MODAL}ms ${EASE_SPRING} !important`,
      }}}}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
        <Typography noWrap sx={{ fontSize: '15px', fontWeight: 600, flex: 1, mr: 1 }}>{selectedItem?.title}</Typography>
        <IconButton onClick={() => setSelectedItem(null)} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedItem && (
          <Box>
            <Box sx={{ textAlign: 'center', bgcolor: '#000', maxHeight: isMobile ? '40vh' : '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component="img" src={(selectedItem as any).thumbnail}
                sx={{ maxWidth: '100%', maxHeight: isMobile ? '40vh' : '60vh', objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="body1" sx={{ fontSize: { xs: '14px', md: '16px' }, lineHeight: 1.7 }}>
                {(selectedItem.summary as string) || ''}
              </Typography>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" component="a" href={selectedItem.url || '#'} target="_blank"
                  sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 600 }}>
                  {t.visitWebsite}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── MediaGrid ──────────────────────────────────────────────────────────
const MediaGrid: React.FC<{
  isLoading: boolean;
  results: ResultMeta[];
  onSelect: (item: ResultDetail | null) => void;
}> = memo(({ isLoading, results, onSelect }) => {
  const theme = useTheme();
  const isXs  = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm  = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd  = useMediaQuery(theme.breakpoints.only('md'));

  const cols = isXs ? 2 : isSm ? 3 : isMd ? 4 : 5;
  const gap  = isXs ? '6px' : isSm ? '8px' : '10px';

  return (
    <Box sx={{ mt: 1, width: '100%', overflowX: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap,
          width: '100%',
        }}
      >
        {isLoading
          ? GRID_SKELETON_KEYS.map((i) => (
              <Box key={i} sx={{ width: '100%', aspectRatio: '4/3' }}>
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '8px' }} />
              </Box>
            ))
          : results.map((item, i) => (
              <Box key={i} className="pm-fade-up" sx={{ animationDelay: staggerDelay(i, 20), minWidth: 0 }}>
                <MediaCard item={item} onClick={(it) => onSelect(it as unknown as ResultDetail | null)} />
              </Box>
            ))
        }
      </Box>
    </Box>
  );
});

// ─── Main ──────────────────────────────────────────────────────────────────────────
const SearchResults: React.FC = () => {
  const results             = useSearchStore((s) => s.results);
  const isInitialLoading    = useSearchStore((s) => s.isInitialLoading);
  const query               = useSearchStore((s) => s.query);
  const type                = useSearchStore((s) => s.type);
  const selectedItem        = useSearchStore((s) => s.selectedItem);
  const setSelectedItem     = useSearchStore((s) => s.setSelectedItem);
  const language            = useSearchStore((s) => s.language);
  const page                = useSearchStore((s) => s.page);
  const expAiSummary        = useSearchStore((s) => s.expAiSummary);
  const expKnowledgePanel   = useSearchStore((s) => s.expKnowledgePanel);
  const expMergedAiPanel    = useSearchStore((s) => s.expMergedAiPanel);
  const geminiApiKey        = useSearchStore((s) => s.geminiApiKey);

  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast]               = useState<string | null>(null);
  const t        = React.useMemo(() => translations[language], [language]);
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark   = theme.palette.mode === 'dark';

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ q: query, t: type, page: value.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isGridLayout = type === 'image' || type === 'video';
  const showAiSummary   = expAiSummary && !!geminiApiKey && type === 'web' && !isInitialLoading && results.length > 0;
  const showKnowledge   = expKnowledgePanel && type === 'web' && !!query;
  // 両方ONかつ統合モードONのとき、MergedAiPanel を使う
  const useMerged       = expMergedAiPanel && showAiSummary && showKnowledge;

  return (
    <Box sx={{ width: '100%' }}>
      {isGridLayout ? (
        <MediaGrid isLoading={isInitialLoading} results={results} onSelect={setSelectedItem} />
      ) : (
        <Box>
          <Box sx={{ display: 'flex', gap: { xs: 0, md: '32px' }, alignItems: 'flex-start' }}>
            {/* ─ メイン列 ─ */}
            <Box sx={{ flex: 1, minWidth: 0, maxWidth: 750 }}>
              {/* 統合パネル（両機能ON + 統合モードON）*/}
              {useMerged && (
                <MergedAiPanel query={query} results={results} />
              )}

              {/* 個別: AI 要約カード（統合モードOFF時のみ）*/}
              {showAiSummary && !useMerged && (
                <AiSummaryCard query={query} results={results} />
              )}

              {/* 個別: ナレッジパネル（モバイル・統合モードOFF時のみ）*/}
              {showKnowledge && isMobile && !useMerged && (
                <KnowledgePanel query={query} mobile />
              )}

              {isInitialLoading
                ? LIST_SKELETON_KEYS.map((i) => <LoadingSkeleton key={i} index={i} isDark={isDark} />)
                : results.length > 0
                  ? results.map((item, i) => (
                      <ResultItem key={i} item={item} query={query} type={type} index={i} onToast={setToast} />
                    ))
                  : (
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                          {t.noResults}
                        </Typography>
                      </Box>
                    )
              }
              {!isInitialLoading && results.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                  <Pagination
                    count={10} page={page} onChange={handlePageChange}
                    color="primary" size={isMobile ? 'medium' : 'large'} siblingCount={isMobile ? 0 : 1}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        transition: `transform ${DUR_NORMAL}ms ${EASE_SPRING}`,
                        '&:hover':  { transform: 'scale(1.1)' },
                        '&:active': { transform: 'scale(0.93)' },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* ─ サイドバー（デスクトップのみ）─ */}
            <Box sx={{ width: 320, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
              <Box sx={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 個別ナレッジパネル: 統合モードOFF時のみ表示 */}
                {showKnowledge && !isMobile && !useMerged && (
                  <KnowledgePanel query={query} />
                )}
                <RelatedSearchesCard query={query} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <PreviewDialog selectedItem={selectedItem} setSelectedItem={setSelectedItem} t={t} />

      <Snackbar
        open={!!toast} autoHideDuration={2200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}
          sx={{ borderRadius: '12px', fontWeight: 500 }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchResults;
