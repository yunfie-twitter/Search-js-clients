import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Link as MuiLink,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Pagination,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { ResultMeta, fetchDetail } from '@yunfie/search-js';
import translations from '../translations';
import RelatedSearchesCard from './RelatedSearchesCard';
import MediaCard from './MediaCard';
import ItemBreadcrumbURL from './ItemBreadcrumbURL';

const GRID_SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);
const LIST_SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => i);

const ResultItem: React.FC<{ item: ResultMeta; query: string; type: string }> = ({ item, query, type }) => {
  const setSelectedItem = useSearchStore((state) => state.setSelectedItem);

  const handleOpenPreview = async (e: React.MouseEvent) => {
    if (type === 'web') return;
    e.preventDefault();
    const detail = await fetchDetail({ q: query }, item._idx);
    setSelectedItem(detail);
  };

  return (
    <Box sx={{ mb: { xs: '20px', md: '28px' }, width: '100%' }}>
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
          mt: '4px',
          mb: '4px',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          '&:hover': { textDecoration: 'underline' },
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

const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', mb: '28px' }}>
    <Skeleton variant="text" width="30%" height={20} />
    <Skeleton variant="text" width="80%" height={32} />
    <Skeleton variant="text" width="100%" height={24} />
  </Box>
);

const PreviewDialog: React.FC<any> = ({ selectedItem, setSelectedItem, t }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={!!selectedItem}
      onClose={() => setSelectedItem(null)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
        <Typography noWrap sx={{ fontSize: '15px', fontWeight: 600, flex: 1, mr: 1 }}>{selectedItem?.title}</Typography>
        <IconButton onClick={() => setSelectedItem(null)} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedItem && (
          <Box>
            <Box sx={{ textAlign: 'center', bgcolor: '#000', maxHeight: isMobile ? '40vh' : '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={(selectedItem as any).thumbnail}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const original = (selectedItem as any).thumbnail;
                  if (target.src.includes('proxy.wholphin.net') && original) {
                    target.src = original;
                  }
                }}
                style={{ maxWidth: '100%', maxHeight: isMobile ? '40vh' : '60vh', objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="body1" sx={{ fontSize: { xs: '14px', md: '16px' } }}>{(selectedItem.summary as string) || ''}</Typography>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" component="a" href={selectedItem.url || '#'} target="_blank" sx={{ borderRadius: '10px', textTransform: 'none' }}>
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
  const t = React.useMemo(() => translations[language], [language]);
  const theme = useTheme();
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
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(auto-fill, minmax(200px, 1fr))',
            },
            gap: { xs: '8px', sm: '16px' },
          }}>
            {isInitialLoading ? (
              GRID_SKELETON_KEYS.map((i) => (
                <Skeleton key={i} variant="rectangular" sx={{ aspectRatio: '16/9', borderRadius: '8px' }} />
              ))
            ) : results.map((item, index) => (
              <MediaCard key={index} item={item} onClick={(item) => setSelectedItem(item as any)} />
            ))}
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
              {isInitialLoading ? (
                LIST_SKELETON_KEYS.map((i) => <LoadingSkeleton key={i} />)
              ) : results.length > 0 ? (
                <Box>
                  {results.map((item, index) => (
                    <ResultItem key={index} item={item} query={query} type={type} />
                  ))}
                </Box>
              ) : (
                <Typography variant="h6" color="text.secondary">{t.noResults}</Typography>
              )}

              {!isInitialLoading && results.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                  <Pagination
                    count={10}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'medium' : 'large'}
                    siblingCount={isMobile ? 0 : 1}
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
