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
  Breadcrumbs
} from '@mui/material';
import { Close as CloseIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { ResultMeta, fetchDetail } from '@yunfie/search-js';
import translations from '../translations';
import RelatedSearchesCard from './RelatedSearchesCard';
import MediaCard from './MediaCard';
import ItemBreadcrumbURL from './ItemBreadcrumbURL';

const ResultItem: React.FC<{ item: ResultMeta; query: string }> = ({ item, query }) => {
  const setSelectedItem = useSearchStore((state) => state.setSelectedItem);
  
  const handleOpenPreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    const detail = await fetchDetail({ q: query }, item._idx);
    setSelectedItem(detail);
  };

  return (
    <Box sx={{ mb: '28px', width: '100%' }}>
      <ItemBreadcrumbURL url={item.url || ''} favicon={(item as any).favicon} />
      <MuiLink 
        href={item.url} 
        target="_blank" 
        rel="noopener"
        className="selectable"
        color="primary"
        sx={{ 
          textDecoration: 'none', 
          fontSize: '20px',
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
        }}
        onClick={handleOpenPreview}
      >
        {item.title}
      </MuiLink>
      <Typography 
        variant="body2" 
        sx={{ 
          lineHeight: 1.58, 
          fontSize: '14px', 
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

const PreviewDialog: React.FC<any> = ({ selectedItem, setSelectedItem, t }) => (
  <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography noWrap>{selectedItem?.title}</Typography>
      <IconButton onClick={() => setSelectedItem(null)}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 0 }}>
      {selectedItem && (
        <Box>
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#000' }}>
            <img 
              src={(selectedItem as any).thumbnail} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const original = (selectedItem as any).thumbnail;
                if (target.src.includes('proxy.wholphin.net') && original) {
                  target.src = original;
                }
              }}
              style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} 
            />
          </Box>
          <Box sx={{ p: 4 }}>
            <Typography variant="body1">{(selectedItem.summary as string) || ''}</Typography>
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant="contained" component="a" href={selectedItem.url || '#'} target="_blank">{t.visitWebsite}</Button>
            </Box>
          </Box>
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

const SearchResults: React.FC = () => {
  const { results, isInitialLoading, query, type, selectedItem, setSelectedItem, language, page } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = translations[language];

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ q: query, t: type, page: value.toString() });
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
              sm: 'repeat(auto-fill, minmax(200px, 1fr))'
            }, 
            gap: { xs: '8px', sm: '16px' }
          }}>
            {isInitialLoading ? (
              [...Array(12)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" sx={{ aspectRatio: '16/9', borderRadius: '8px' }} />
              ))
            ) : results.map((item, index) => (
              <MediaCard key={index} item={item} onClick={(item) => setSelectedItem(item as any)} />
            ))}
          </Box>
        </Box>
      ) : (
        <Box>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            sx={{ mb: 2, '& .MuiBreadcrumbs-li': { fontSize: '14px' } }}
          >
            <MuiLink component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
              Home
            </MuiLink>
            <Typography color="text.primary">検索結果: "{query}"</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: { xs: 0, md: '60px' }, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0, maxWidth: 750 }}>
              {isInitialLoading ? (
                [...Array(5)].map((_, i) => <LoadingSkeleton key={i} />)
              ) : results.length > 0 ? (
                <Box>
                  {results.map((item, index) => (
                    <ResultItem key={index} item={item} query={query} />
                  ))}
                </Box>
              ) : (
                <Typography variant="h6" color="text.secondary">{t.noResults}</Typography>
              )}

              {!isInitialLoading && results.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                  <Pagination 
                    count={10} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                    size="large"
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
