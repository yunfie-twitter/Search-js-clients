import React, { useEffect } from 'react';
import {
  Box, Typography, Link as MuiLink, Skeleton,
  Dialog, DialogTitle, DialogContent, IconButton,
  Button, Pagination, Breadcrumbs, useMediaQuery, useTheme,
} from '@mui/material';
import { Close as CloseIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { ResultMeta, fetchDetail } from '@yunfie/search-js';
import translations from '../translations';
import RelatedSearchesCard from './RelatedSearchesCard';
import MediaCard from './MediaCard';
import ItemBreadcrumbURL from './ItemBreadcrumbURL';
import { EASE_SPRING, DUR_NORMAL, DUR_MODAL, staggerDelay } from '../utils/motion';

const GRID_SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);
const LIST_SKELETON_KEYS = Array.from({ length: 5  }, (_, i) => i);

// ─ ResultItem ─
const ResultItem: React.FC<{ item: ResultMeta; query: string; type: string; index: number }> = ({ item, query, type, index }) => {
  const setSelectedItem = useSearchStore((state) => state.setSelectedItem);

  const handleOpenPreview = async (e: React.MouseEvent) => {
    if (type === 'web') return;
    e.preventDefault();
    const detail = await fetchDetail({ q: query }, item._idx);
    setSelectedItem(detail);
  };

  return (
    <Box
      className="pm-fade-up"
      sx={{
        mb: { xs: '20px', md: '28px' },
        width: '100%',
        animationDelay: staggerDelay(index, 25),
      }}
    >
      <ItemBreadcrumbURL url={item.url || ''} favicon={(item as any).favicon} />
      <MuiLink
        href={item.url}
        target="_blank"
        rel="noopener"
        className="selectable"
        color="primary"
        sx={{
          textDecoration: 'none',
          fontSize: { xs: '17px', md: '20px' },
          display: '-webkit-box',
          mt: '4px', mb: '4px',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          '&:hover': {
            textDecoration: 'underline',
            opacity: 0.85,
          },
          transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
        }}
        onClick={handleOpenPreview}
      >
        {item.title}
      </MuiLink>
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.6,
          fontSize: { xs: '13px', md: '14px' },
          color: 'text.secondary',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {(item as any).summary || (item as any).snippet || ''}
      </Typography>
    </Box>
  );
};

// ─ Shimmer skeleton ─
const LoadingSkeleton = ({ index }: { index: number }) => (
  <Box
    className="pm-fade-up"
    sx={{ width: '100%', mb: '28px', animationDelay: staggerDelay(index, 60) }}
  >
    <Box className="pm-skeleton" sx={{ width: '30%', height: 16, mb: '8px' }} />
    <Box className="pm-skeleton" sx={{ width: '80%', height: 24, mb: '6px' }} />
    <Box className="pm-skeleton" sx={{ width: '100%', height: 18 }} />
    <Box className="pm-skeleton" sx={{ width: '75%',  height: 18, mt: '4px' }} />
  </Box>
);

// ─ Cinematic PreviewDialog ─
const PreviewDialog: React.FC<any> = ({ selectedItem, setSelectedItem, t }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark   = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={!!selectedItem}
      onClose={() => setSelectedItem(null)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      TransitionProps={{ timeout: { enter: 360, exit: 200 } }}
      PaperProps={{
        className: 'pm-modal',
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          backgroundColor: isDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          overflow: 'hidden',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
            transition: `opacity ${DUR_MODAL}ms ${EASE_SPRING} !important`,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
        <Typography noWrap sx={{ fontSize: '15px', fontWeight: 600, flex: 1, mr: 1 }}>{selectedItem?.title}</Typography>
        <IconButton
          className="pm-icon-btn"
          onClick={() => setSelectedItem(null)}
          size="small"
          sx={{ transition: `transform ${DUR_NORMAL}ms ${EASE_SPRING}, opacity ${DUR_NORMAL}ms ${EASE_SPRING}` }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedItem && (
          <Box>
            <Box sx={{ textAlign: 'center', bgcolor: '#000', maxHeight: isMobile ? '40vh' : '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                component="img"
                src={(selectedItem as any).thumbnail}
                onError={(e: any) => {
                  const original = (selectedItem as any).thumbnail;
                  if (e.target.src.includes('proxy') && original) e.target.src = original;
                }}
                sx={{
                  maxWidth: '100%',
                  maxHeight: isMobile ? '40vh' : '60vh',
                  objectFit: 'contain',
                  transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}`,
                }}
              />
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="body1" sx={{ fontSize: { xs: '14px', md: '16px' }, lineHeight: 1.7 }}>
                {(selectedItem.summary as string) || ''}
              </Typography>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  className="pm-btn"
                  variant="contained"
                  component="a"
                  href={selectedItem.url || '#'}
                  target="_blank"
                  sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 600 }}
                >
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

// ─ Main ─
const SearchResults: React.FC = () => {
  const results          = useSearchStore((s) => s.results);
  const isInitialLoading = useSearchStore((s) => s.isInitialLoading);
  const query            = useSearchStore((s) => s.query);
  const type             = useSearchStore((s) => s.type);
  const selectedItem     = useSearchStore((s) => s.selectedItem);
  const setSelectedItem  = useSearchStore((s) => s.setSelectedItem);
  const language         = useSearchStore((s) => s.language);
  const page             = useSearchStore((s) => s.page);

  const [searchParams, setSearchParams] = useSearchParams();
  const t        = React.useMemo(() => translations[language], [language]);
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ q: query, t: type, page: value.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isGridLayout = type === 'image' || type === 'video';

  return (
    <Box sx={{ width: '100%' }}>
      {isGridLayout ? (
        <Box sx={{ mt: 2 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(200px, 1fr))' },
            gap: { xs: '8px', sm: '16px' },
          }}>
            {isInitialLoading
              ? GRID_SKELETON_KEYS.map((i) => (
                  <Skeleton key={i} variant="rectangular" sx={{ aspectRatio: '16/9', borderRadius: '12px', animation: 'wave' }} />
                ))
              : results.map((item, index) => (
                  <Box key={index} className="pm-card pm-fade-up" sx={{ animationDelay: staggerDelay(index, 20) }}>
                    <MediaCard item={item} onClick={(item) => setSelectedItem(item as any)} />
                  </Box>
                ))
            }
          </Box>
        </Box>
      ) : (
        <Box>
          {!isMobile && (
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mb: 2, '& .MuiBreadcrumbs-li': { fontSize: '14px' } }}
            >
              <MuiLink component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
                {t.home}
              </MuiLink>
              <Typography color="text.primary">{t.searchResultsFor} "{query}"</Typography>
            </Breadcrumbs>
          )}

          <Box sx={{ display: 'flex', gap: { xs: 0, md: '60px' }, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0, maxWidth: 750 }}>
              {isInitialLoading
                ? LIST_SKELETON_KEYS.map((i) => <LoadingSkeleton key={i} index={i} />)
                : results.length > 0
                  ? results.map((item, index) => <ResultItem key={index} item={item} query={query} type={type} index={index} />)
                  : <Typography variant="h6" color="text.secondary">{t.noResults}</Typography>
              }

              {!isInitialLoading && results.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                  <Pagination
                    count={10}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'medium' : 'large'}
                    siblingCount={isMobile ? 0 : 1}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        transition: `transform ${DUR_NORMAL}ms ${EASE_SPRING}, background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
                        '&:hover': { transform: 'scale(1.1)' },
                        '&:active': { transform: 'scale(0.93)' },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ width: 350, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
              <Box sx={{ position: 'sticky', top: 160 }}>
                <RelatedSearchesCard query={query} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <PreviewDialog selectedItem={selectedItem} setSelectedItem={setSelectedItem} t={t} />
    </Box>
  );
};

export default SearchResults;
