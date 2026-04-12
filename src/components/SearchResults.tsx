import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Box, Typography, Link as MuiLink, Skeleton,
  Dialog, DialogTitle, DialogContent, IconButton,
  Button, Pagination, useMediaQuery, useTheme,
  Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  BookmarkBorderOutlined as SaveIcon,
  ShareOutlined as ShareIcon,
  ContentCopyOutlined as CopyIcon,
  OpenInNewOutlined as OpenNewIcon,
  SearchOutlined as SearchIcon,
  FindInPageOutlined as FindInPageIcon,
  ScreenShareOutlined as ScreenShareIcon,
  ViewAgendaOutlined as ComfortableIcon,
  ViewListOutlined as CompactIcon,
  FormatListBulletedOutlined as ListDensityIcon,
  FullscreenOutlined as FocusIcon,
  KeyboardArrowUpOutlined as UpIcon,
  KeyboardArrowDownOutlined as DownIcon,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { ResultMeta, ResultDetail, fetchDetail } from '@yunfie/search-js';
import translations from '../translations';
import RelatedSearchesCard from './RelatedSearchesCard';
import MediaCard from './MediaCard';
import ItemBreadcrumbURL from './ItemBreadcrumbURL';
import AiSummaryCard from './AiSummaryCard';
import KnowledgePanel from './KnowledgePanel';
import MergedAiPanel from './MergedAiPanel';
import QueryExpansionChips from './QueryExpansionChips';
import { EASE_SPRING, DUR_NORMAL, staggerDelay } from '../utils/motion';
import { useLongPress } from '../hooks/useLongPress';
import html2canvas from 'html2canvas';
import PeekAndPop from './PeekAndPop';
import { useVirtualVisibility } from '../hooks/useVirtualVisibility';
import VideoPlayerDialog from './VideoPlayerDialog';
import { triggerHaptic } from '../utils/haptics';

const GRID_SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);
const LIST_SKELETON_KEYS = Array.from({ length: 5  }, (_, i) => i);

// ─── Mini Browser Preview Dialog ───────────────────────────────────────────────
const MiniBrowserDialog: React.FC<{ url: string | null; onClose: () => void }> = memo(({ url, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  if (!url) return null;

  return (
    <Dialog
      open={!!url} onClose={onClose}
      maxWidth="lg" fullWidth fullScreen={isMobile}
      TransitionProps={{ timeout: { enter: 300, exit: 200 } }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          backgroundColor: isDark ? 'rgba(20,20,26,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          height: isMobile ? '100%' : '80vh',
          display: 'flex', flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          <IconButton size="small" onClick={onClose} sx={{ mr: 0.5 }}><CloseIcon /></IconButton>
          <Typography noWrap sx={{ fontSize: '14px', fontWeight: 600, opacity: 0.8 }}>{url}</Typography>
        </Box>
        <IconButton size="small" component="a" href={url} target="_blank"><OpenNewIcon fontSize="small" /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" sandbox="allow-same-origin allow-scripts" />
      </Box>
    </Dialog>
  );
});

// ─── Focus Mode Dialog ────────────────────────────────────────────────────────
const FocusModeDialog: React.FC<{ open: boolean; results: ResultMeta[]; initialIndex: number; onClose: () => void; type: string }> = memo(({ open, results, initialIndex, onClose, type }) => {
  const [index, setIndex] = useState(initialIndex);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const language = useSearchStore((s) => s.language);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const handleNext = useCallback(() => setIndex(prev => Math.min(prev + 1, results.length - 1)), [results.length]);
  const handlePrev = useCallback(() => setIndex(prev => Math.max(prev - 1, 0)), []);

  if (!open || !results || results.length === 0) return null;

  const current = results[index] as any;
  const isMedia = type === 'image' || type === 'video';
  const displayUrl = isMedia ? (current.url || current.thumbnail) : current.url;

  return (
    <Dialog open={open} fullScreen PaperProps={{ sx: { bgcolor: isDark ? '#000' : '#f5f5f7', display: 'flex', flexDirection: 'column' } }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <IconButton onClick={onClose} sx={{ bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 6 }, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {isMedia ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Box component="img" src={displayUrl} sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', mb: 2 }} />
            <Typography variant="h6" sx={{ color: isDark ? '#fff' : '#000', textAlign: 'center' }}>{current.title}</Typography>
            <Button variant="contained" component="a" href={current.url} target="_blank" sx={{ mt: 2, borderRadius: '12px', px: 4, textTransform: 'none' }}>
              {language === 'ja' ? 'サイトを開く' : 'Visit Website'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 800, p: { xs: 3, md: 5 }, bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{current.url}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, lineHeight: 1.4 }}>{current.title}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '16px' }}>{(current as any).summary || (current as any).snippet}</Typography>
            <Button variant="contained" component="a" href={current.url} target="_blank" sx={{ mt: 4, borderRadius: '12px', px: 4, textTransform: 'none' }}>
              {language === 'ja' ? 'サイトを開く' : 'Visit Website'}
            </Button>
          </Box>
        )}
      </Box>
      <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <IconButton onClick={handlePrev} disabled={index === 0} sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}><UpIcon /></IconButton>
        <IconButton onClick={handleNext} disabled={index === results.length - 1} sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}><DownIcon /></IconButton>
      </Box>
    </Dialog>
  );
});

// ─── Shared Settings for Result Items ─────────────────────────────────────────
export interface ItemSettings {
  language: string;
  setSelectedItem: (item: any) => void;
  expLongPressMenu: boolean;
  expViewDensity: boolean;
  viewDensity: 'comfortable' | 'compact' | 'list';
  expSwipeActions: boolean;
  expCursorHalo: boolean;
  expMarkerHighlight: boolean;
  expSonicUi: boolean;
  expFocusMode: boolean;
  expLowEndMode: boolean;
  expLongPressRelated: boolean;
  expScreenshotShare: boolean;
  expMiniBrowser: boolean;
}

// ─── Result Action Menu ────────────────────────────────────────────
interface ActionMenuProps {
  item: ResultMeta;
  index: number;
  settings: ItemSettings;
  onToast: (msg: string) => void;
  openFromLongPress?: boolean;
  longPressAnchorEl?: HTMLElement | null;
  onCloseLongPress?: () => void;
  onMiniBrowser?: (url: string) => void;
}
const ResultActionMenu: React.FC<ActionMenuProps> = memo(({ item, index, settings, onToast, openFromLongPress, longPressAnchorEl, onCloseLongPress, onMiniBrowser }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = openFromLongPress ? Boolean(longPressAnchorEl) : Boolean(anchor);
  const actualAnchor = openFromLongPress ? longPressAnchorEl : anchor;
  
  const navigate = useNavigate();
  const { language, expLongPressRelated, expScreenshotShare, expMiniBrowser } = settings;

  const handleClose = useCallback(() => {
    setAnchor(null);
    if (onCloseLongPress) onCloseLongPress();
  }, [onCloseLongPress]);

  const handleCopy    = useCallback(() => { navigator.clipboard.writeText(item.url || '').then(() => onToast(language === 'ja' ? 'URLをコピーしました' : 'URL copied')); handleClose(); }, [item.url, language, onToast, handleClose]);
  const handleShare   = useCallback(async () => {
    if (navigator.share) { await navigator.share({ title: item.title || '', url: item.url || '' }); }
    else { navigator.clipboard.writeText(item.url || ''); onToast(language === 'ja' ? 'URLをコピーしました' : 'URL copied'); }
    handleClose();
  }, [item.title, item.url, language, onToast, handleClose]);
  const handleOpenNew = useCallback(() => { window.open(item.url, '_blank', 'noopener'); handleClose(); }, [item.url, handleClose]);
  const handleSave    = useCallback(() => { onToast(language === 'ja' ? '保存しました（未実装）' : 'Saved (Not implemented)'); handleClose(); }, [language, onToast, handleClose]);

  const handleSearchSite = useCallback(() => {
    if (!item.url) return;
    try {
      const domain = new URL(item.url).hostname;
      navigate(`/search?q=${encodeURIComponent(`site:${domain} `)}`);
    } catch { }
    handleClose();
  }, [item.url, navigate, handleClose]);

  const handleSearchTitle = useCallback(() => {
    if (!item.title) return;
    navigate(`/search?q=${encodeURIComponent(item.title)}`);
    handleClose();
  }, [item.title, navigate, handleClose]);

  const handleScreenshotShare = useCallback(async () => {
    handleClose();
    const el = document.getElementById(`result-item-${index}`);
    if (!el) return;
    try {
      onToast(language === 'ja' ? '画像を生成中...' : 'Generating image...');
      await new Promise(res => setTimeout(res, 100));
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create blob');
        const file = new File([blob], 'search-result.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: item.title, files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'search-result.png'; a.click();
          URL.revokeObjectURL(url);
          onToast(language === 'ja' ? '画像を保存しました' : 'Image saved');
        }
      }, 'image/png');
    } catch (e) {
      onToast(language === 'ja' ? '共有に失敗しました' : 'Share failed');
    }
  }, [index, item.title, language, onToast, handleClose]);

  const handlePreview = useCallback(() => {
    if (onMiniBrowser && item.url) {
      onMiniBrowser(item.url);
    }
    handleClose();
  }, [onMiniBrowser, item.url, handleClose]);

  const menuItems = useMemo(() => {
    const base = [
      { label: language === 'ja' ? '保存' : 'Save', Icon: SaveIcon, action: handleSave },
      { label: language === 'ja' ? '共有' : 'Share', Icon: ShareIcon, action: handleShare },
      { label: language === 'ja' ? 'URLをコピー' : 'Copy URL', Icon: CopyIcon, action: handleCopy },
      { label: language === 'ja' ? '新規タブで開く' : 'Open in New Tab', Icon: OpenNewIcon, action: handleOpenNew },
    ];
    if (expMiniBrowser) base.push({ label: language === 'ja' ? 'プレビュー' : 'Preview', Icon: OpenNewIcon, action: handlePreview });
    if (expLongPressRelated) {
      base.push({ label: language === 'ja' ? 'このサイト内を検索' : 'Search within site', Icon: FindInPageIcon, action: handleSearchSite });
      base.push({ label: language === 'ja' ? 'タイトルで再検索' : 'Search by title', Icon: SearchIcon, action: handleSearchTitle });
    }
    if (expScreenshotShare) base.push({ label: language === 'ja' ? '画像としてシェア' : 'Share as Image', Icon: ScreenShareIcon, action: handleScreenshotShare });
    return base;
  }, [language, expMiniBrowser, expLongPressRelated, expScreenshotShare, handleSave, handleShare, handleCopy, handleOpenNew, handlePreview, handleSearchSite, handleSearchTitle, handleScreenshotShare]);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{
          opacity: 0, '.pm-result-card-inner:hover &': { opacity: 1 },
          transition: `opacity ${DUR_NORMAL}ms ${EASE_SPRING}, transform 120ms ${EASE_SPRING}`,
          '&:active': { transform: 'scale(0.88)' },
          color: 'text.secondary', p: '4px', ml: 'auto', flexShrink: 0,
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={actualAnchor} open={open} onClose={handleClose}
        PaperProps={{ sx: { borderRadius: '14px', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', overflow: 'hidden' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems.map(({ label, Icon, action }) => (
          <MenuItem key={label} onClick={(e) => { e.stopPropagation(); action(); }} sx={{ py: '10px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 32 }}><Icon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

// ─── PreviewDialog ───────────────────────────────────────────────────────
const PreviewDialog: React.FC<any> = memo(({ selectedItem, setSelectedItem, t }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark   = theme.palette.mode === 'dark';
  const expBottomSheet = useSearchStore((s) => s.expBottomSheet);

  const bottomSheetStyle = useMemo(() => (expBottomSheet && isMobile ? {
    m: 0, mb: 0, mt: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    width: '100%', maxHeight: '90vh',
    animation: 'pm-slide-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
  } : { borderRadius: isMobile ? 0 : '20px' }), [expBottomSheet, isMobile]);

  return (
    <Dialog
      open={!!selectedItem} onClose={() => setSelectedItem(null)}
      maxWidth="md" fullWidth fullScreen={isMobile && !expBottomSheet}
      TransitionProps={{ timeout: { enter: 360, exit: 200 } }}
      PaperProps={{
        sx: {
          backgroundColor: isDark ? 'rgba(20,20,26,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          ...bottomSheetStyle
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
        <Typography noWrap sx={{ fontSize: '15px', fontWeight: 600, flex: 1, mr: 1 }}>{selectedItem?.title}</Typography>
        <IconButton onClick={() => setSelectedItem(null)} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedItem && (
          <Box>
            <Box sx={{ textAlign: 'center', bgcolor: '#000', maxHeight: isMobile ? '40vh' : '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component="img" src={(selectedItem as any).thumbnail} sx={{ maxWidth: '100%', maxHeight: isMobile ? '40vh' : '60vh', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="body1" sx={{ fontSize: { xs: '14px', md: '16px' }, lineHeight: 1.7 }}>{(selectedItem.summary as string) || ''}</Typography>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" component="a" href={selectedItem.url || '#'} target="_blank" sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 600 }}>{t.visitWebsite}</Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
});

// ─── LoadingSkeleton ──────────────────────────────────────────────
const LoadingSkeleton = memo(({ isDark }: { isDark: boolean }) => (
  <Box
    sx={{
      mb: '14px', p: '16px 18px', borderRadius: '16px',
      backgroundColor: isDark ? '#14141A' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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

// ─── ResultItem Component (Optimized) ──────────────────────────────────────────
const ResultItem: React.FC<{ item: ResultMeta; query: string; type: string; index: number; settings: ItemSettings; onToast: (m: string) => void; onMiniBrowser: (url: string) => void; onFocusMode?: (index: number) => void; onPeek?: (item: ResultMeta) => void; onSelect?: (item: ResultMeta) => void }> = memo(
  ({ item, query, type, index, settings, onToast, onMiniBrowser, onFocusMode, onPeek, onSelect }) => {
    const { ref, isVisible, hasBeenVisible } = useVirtualVisibility<HTMLDivElement>({ rootMargin: '600px' });
    
    const {
      setSelectedItem, expLongPressMenu, expViewDensity, viewDensity,
      expSwipeActions, expCursorHalo, expMarkerHighlight, expSonicUi,
      expFocusMode, expLowEndMode, language
    } = settings;

    const [longPressAnchor, setLongPressAnchor] = useState<HTMLElement | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const touchStart = useRef<{ x: number, y: number } | null>(null);
    const isSwiping = useRef(false);
    const SWIPE_THRESHOLD = 80;

    const handleOpenPreview = useCallback(async (e?: React.MouseEvent) => {
      if (type === 'web') return;
      if (e) e.preventDefault();
      const detail = await fetchDetail({ q: query }, item._idx);
      setSelectedItem(detail);
    }, [type, query, item._idx, setSelectedItem]);

    const longPressHandlers = useLongPress({
      onLongPress: useCallback(() => {
        if (onPeek) {
          onPeek(item);
        } else if (expLongPressMenu) {
           const el = document.getElementById(`result-item-${index}`);
           if (el) setLongPressAnchor(el);
        }
      }, [onPeek, item, expLongPressMenu, index]),
      onClick: useCallback(() => {
         if (expSonicUi) { import('../utils/sonic').then(m => m.playSonicClick()); }
         if (onSelect) {
            onSelect(item);
         } else if (type !== 'web') {
            handleOpenPreview();
         } else {
            window.open(item.url, '_blank', 'noopener');
         }
      }, [expSonicUi, onSelect, item, type, handleOpenPreview]),
      delay: onPeek ? 400 : 500
    });

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!expSwipeActions) return;
      const touchX = e.touches[0].clientX;
      if (touchX < 30 || touchX > window.innerWidth - 30) return;
      touchStart.current = { x: touchX, y: e.touches[0].clientY };
      isSwiping.current = false;
      setSwipeOffset(0);
    }, [expSwipeActions]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!expSwipeActions || !touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      
      if (!isSwiping.current) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
           touchStart.current = null;
           return;
        } else if (Math.abs(dx) > 10) {
           isSwiping.current = true;
        }
      }
      
      if (isSwiping.current) {
        if (e.cancelable) e.preventDefault();
        setSwipeOffset(Math.max(Math.min(dx, 100), -100));
      }
    }, [expSwipeActions]);

    const handleTouchEnd = useCallback(() => {
      if (!expSwipeActions || !isSwiping.current) {
        touchStart.current = null;
        setSwipeOffset(0);
        return;
      }

      if (swipeOffset > SWIPE_THRESHOLD) {
        window.open(item.url, '_blank', 'noopener');
      } else if (swipeOffset < -SWIPE_THRESHOLD) {
        if (expSonicUi) { import('../utils/sonic').then(m => m.playSonicSuccess()); }
        onToast(language === 'ja' ? '「後で読む」に保存しました' : 'Saved to Read Later');
      }

      setSwipeOffset(0);
      isSwiping.current = false;
      touchStart.current = null;
    }, [expSwipeActions, swipeOffset, expSonicUi, language, onToast, item.url]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!expCursorHalo) return;
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }, [expCursorHalo]);

    const highlightParts = useMemo(() => {
       if (!expMarkerHighlight || !query) return null;
       try {
         return new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
       } catch { return null; }
    }, [expMarkerHighlight, query]);

    const renderSnippet = useCallback((text: string) => {
       if (!highlightParts) return text;
       const parts = text.split(highlightParts);
       return parts.map((part, i) =>
         part.toLowerCase() === query.toLowerCase() 
           ? <mark key={i} className="pm-marker" style={{ color: 'inherit', background: 'transparent' }}>{part}</mark> 
           : part
       );
    }, [highlightParts, query]);

    const handleFocusAction = useCallback(() => {
      if (onFocusMode) onFocusMode(index);
    }, [onFocusMode, index]);

    const density = expViewDensity ? viewDensity : 'comfortable';
    let titleFontSize = { xs: '16px', md: '18px' };
    let snippetLines = 2;
    let snippetDisplay = 'block';
    
    if (density === 'compact') {
      titleFontSize = { xs: '15px', md: '16px' };
      snippetLines = 1;
    } else if (density === 'list') {
      titleFontSize = { xs: '15px', md: '16px' };
      snippetDisplay = 'none';
    }

    const handlers: any = expLongPressMenu ? longPressHandlers : {};
    const finalHandlers = useMemo(() => ({
      ...handlers,
      onTouchStart: (e: React.TouchEvent) => {
        handleTouchStart(e);
        if (handlers.onTouchStart) handlers.onTouchStart(e);
      },
      onTouchMove: (e: React.TouchEvent) => {
        handleTouchMove(e);
        if (handlers.onTouchMove) handlers.onTouchMove(e);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        handleTouchEnd();
        if (handlers.onTouchEnd) handlers.onTouchEnd(e);
      },
      onMouseMove: handleMouseMove,
    }), [handlers, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseMove]);

    const getStagger = (i: number, base: number) => expLowEndMode ? 0 : staggerDelay(i, base);

    return (
      <Box 
        ref={ref}
        className="pm-result-item-root"
        sx={{ 
          contain: 'content', 
          contentVisibility: 'auto',
          containIntrinsicSize: '0 120px',
          minHeight: '120px',
          position: 'relative',
        }}
      >
        <Box 
          sx={{ 
            visibility: isVisible || hasBeenVisible ? 'visible' : 'hidden',
            opacity: isVisible || hasBeenVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {expSwipeActions && (
            <>
              <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%', bgcolor: 'success.main', display: 'flex', alignItems: 'center', px: 3 }}>
                <OpenNewIcon sx={{ color: '#fff' }} />
              </Box>
              <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', bgcolor: 'info.main', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 3 }}>
                <SaveIcon sx={{ color: '#fff' }} />
              </Box>
            </>
          )}
          <Box
            id={`result-item-${index}`}
            className={`pm-result-card-inner pm-fade-up ${expCursorHalo ? 'pm-halo' : ''}`}
            {...finalHandlers}
            style={{ 
              transform: `translateX(${swipeOffset}px) translateZ(0)`,
              animationDelay: getStagger(index, 25) 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ItemBreadcrumbURL url={item.url || ''} favicon={(item as any).favicon} />
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                {expFocusMode && (
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleFocusAction(); }} sx={{ color: 'text.secondary', opacity: 0, '.pm-result-card-inner:hover &': { opacity: 1 } }}>
                    <FocusIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                <ResultActionMenu 
                   item={item} 
                   index={index}
                   settings={settings}
                   onToast={onToast} 
                   openFromLongPress={true} 
                   longPressAnchorEl={longPressAnchor} 
                   onCloseLongPress={useCallback(() => setLongPressAnchor(null), [])} 
                   onMiniBrowser={onMiniBrowser}
                />
              </Box>
            </Box>
            <MuiLink
              href={item.url} target="_blank" rel="noopener"
              className="selectable" color="primary"
              sx={{
                textDecoration: 'none',
                fontSize: titleFontSize,
                fontWeight: 650, letterSpacing: '-0.01em',
                display: '-webkit-box',
                mt: '6px', mb: density === 'list' ? 0 : '6px',
                wordBreak: 'break-word',
                '&:hover': { textDecoration: 'underline', opacity: 0.85 },
                overflow: 'hidden', textOverflow: 'ellipsis',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                lineHeight: 1.45,
                pointerEvents: expLongPressMenu ? 'none' : 'auto',
              }}
              onClick={expLongPressMenu ? (e) => e.preventDefault() : (e) => { e.preventDefault(); onSelect?.(item); }}
            >
              {renderSnippet(item.title || '')}
            </MuiLink>
            {snippetDisplay !== 'none' && (
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.55, fontSize: { xs: '13px', md: '14px' },
                  color: 'text.secondary',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: snippetLines, WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}
              >
                {renderSnippet((item as any).summary || (item as any).snippet || '')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box 
          component="a" 
          href={item.url} 
          target="_blank" 
          aria-label={item.title}
          sx={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            zIndex: isVisible ? -1 : 1, 
            opacity: 0,
            display: isVisible ? 'none' : 'block'
          }} 
        />
      </Box>
    );
  }
);

// ─── MediaGrid (Virtualized & Invincible Optimization) ──────────────────────────────────────────────────────────
const MediaGrid: React.FC<{
  isLoading: boolean;
  results: ResultMeta[];
  onSelect: (item: ResultMeta | null) => void;
  onFocusMode?: (index: number) => void;
  onPeek?: (item: ResultMeta) => void;
}> = memo(({ isLoading, results, onSelect, onFocusMode, onPeek }) => {
  const theme = useTheme();
  const isXs  = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm  = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd  = useMediaQuery(theme.breakpoints.only('md'));
  const expFocusMode = useSearchStore((s) => s.expFocusMode);
  const expProgressiveRender = useSearchStore((s) => s.expProgressiveRender);

  const [visibleCount, setVisibleCount] = useState(0);
  const [internalResults, setInternalResults] = useState<ResultMeta[]>([]);
  const renderTaskRef = useRef<number | null>(null);
  const mountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (renderTaskRef.current) cancelAnimationFrame(renderTaskRef.current);
    if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
    
    if (isLoading) {
      setVisibleCount(0);
      setInternalResults([]);
      return;
    }

    if (results.length > 0) {
      mountTimerRef.current = setTimeout(() => {
        setInternalResults(results);
        if (expProgressiveRender) {
          let current = 12;
          const step = 4;
          const processRender = () => {
            if (current < results.length) {
              current += step;
              setVisibleCount(current);
              const scheduler = (window as any).requestIdleCallback || requestAnimationFrame;
              renderTaskRef.current = scheduler(processRender);
            }
          };
          setVisibleCount(12);
          renderTaskRef.current = requestAnimationFrame(processRender);
        } else {
          setVisibleCount(results.length);
        }
      }, 32);
      
      return () => {
        if (renderTaskRef.current) cancelAnimationFrame(renderTaskRef.current);
        if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
      };
    }
    return undefined;
  }, [isLoading, results, expProgressiveRender]);

  const cols = isXs ? 2 : isSm ? 3 : isMd ? 4 : 5;
  const gap  = isXs ? '6px' : isSm ? '8px' : '10px';

  return (
    <Box sx={{ mt: 1, width: '100%', overflowX: 'hidden', minHeight: '50vh' }}>
      {expFocusMode && !isLoading && results.length > 0 && (
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button size="small" variant="outlined" startIcon={<FocusIcon />} onClick={() => onFocusMode?.(0)} sx={{ borderRadius: '12px' }}>
              Focus Mode
            </Button>
         </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap,
          width: '100%',
        }}
      >
        {isLoading || internalResults.length === 0
          ? GRID_SKELETON_KEYS.map((i) => (
              <Box key={i} sx={{ width: '100%', aspectRatio: '4/3' }}>
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '8px' }} />
              </Box>
            ))
          : internalResults.slice(0, visibleCount).map((item, i) => (
              <Box key={i} className="pm-fade-up" sx={{ minWidth: 0, position: 'relative' }}>
                <MediaCard item={item} onClick={(it) => onSelect(it)} onPeek={onPeek} />
              </Box>
            ))
        }
      </Box>
    </Box>
  );
});

// ─── Main ──────────────────────────────────────────────────────────────────────────
const SearchResults: React.FC = () => {
  const {
    results, isInitialLoading, query: rawQuery, type, selectedItem, setSelectedItem,
    language, page, expAiSummary, expKnowledgePanel, expMergedAiPanel, geminiApiKey,
    expViewDensity, viewDensity, setViewDensity, expQueryExpansion, expFocusMode,
    expPeekAndPop, expProgressiveRender, expNewsMarkdown, activeVideo, setActiveVideo,
    expLongPressMenu, expSwipeActions, expCursorHalo, expMarkerHighlight, expSonicUi,
    expLowEndMode, expLongPressRelated, expScreenshotShare, expMiniBrowser
  } = useSearchStore(useShallow((s) => ({
    results: s.results, isInitialLoading: s.isInitialLoading, query: s.query, type: s.type,
    selectedItem: s.selectedItem, setSelectedItem: s.setSelectedItem, language: s.language,
    page: s.page, expAiSummary: s.expAiSummary, expKnowledgePanel: s.expKnowledgePanel,
    expMergedAiPanel: s.expMergedAiPanel, geminiApiKey: s.geminiApiKey,
    expViewDensity: s.expViewDensity, viewDensity: s.viewDensity, setViewDensity: s.setViewDensity,
    expQueryExpansion: s.expQueryExpansion, expFocusMode: s.expFocusMode,
    expPeekAndPop: s.expPeekAndPop, expProgressiveRender: s.expProgressiveRender,
    expNewsMarkdown: s.expNewsMarkdown, activeVideo: s.activeVideo, setActiveVideo: s.setActiveVideo,
    expLongPressMenu: s.expLongPressMenu, expSwipeActions: s.expSwipeActions,
    expCursorHalo: s.expCursorHalo, expMarkerHighlight: s.expMarkerHighlight,
    expSonicUi: s.expSonicUi, expLowEndMode: s.expLowEndMode,
    expLongPressRelated: s.expLongPressRelated, expScreenshotShare: s.expScreenshotShare,
    expMiniBrowser: s.expMiniBrowser
  })));

  const query = React.useDeferredValue(rawQuery);

  const itemSettings: ItemSettings = useMemo(() => ({
    setSelectedItem, expLongPressMenu, expViewDensity, viewDensity,
    expSwipeActions, expCursorHalo, expMarkerHighlight, expSonicUi,
    expFocusMode, expLowEndMode, language, expLongPressRelated,
    expScreenshotShare, expMiniBrowser
  }), [setSelectedItem, expLongPressMenu, expViewDensity, viewDensity, expSwipeActions, expCursorHalo, expMarkerHighlight, expSonicUi, expFocusMode, expLowEndMode, language, expLongPressRelated, expScreenshotShare, expMiniBrowser]);

  const navigate = useNavigate();
  const [_searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast]               = useState<string | null>(null);
  const [miniBrowserUrl, setMiniBrowserUrl] = useState<string | null>(null);

  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [peekItem, setPeekItem] = useState<ResultMeta | null>(null);

  const [visibleCount, setVisibleCount] = useState(expProgressiveRender ? 6 : 20);

  useEffect(() => {
    let startTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    if (!isInitialLoading && results.length > 0) {
      if (expProgressiveRender) {
        let current = 6;
        const step = 4;
        const update = () => {
          if (current < results.length) {
            current += step;
            setVisibleCount(current);
            rafId = requestAnimationFrame(update);
          }
        };
        startTimer = setTimeout(() => {
          rafId = requestAnimationFrame(update);
        }, 16);
      } else {
        setVisibleCount(results.length);
      }
    } else {
      setVisibleCount(expProgressiveRender ? 6 : 20);
    }
    
    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(rafId);
    };
  }, [isInitialLoading, results.length, expProgressiveRender]);

  const t        = useMemo(() => translations[language], [language]);
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark   = theme.palette.mode === 'dark';

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    React.startTransition(() => {
      setSearchParams({ q: query, t: type, page: value.toString() });
      const container = document.getElementById('search-scroll-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [query, type, setSearchParams]);

  const openFocusMode = useCallback((index: number) => {
    setFocusIndex(index);
    setFocusModeOpen(true);
  }, []);

  const handlePeekConfirm = useCallback(async (item: ResultMeta) => {
    if (type !== 'web') {
      const detail = await fetchDetail({ q: query }, item._idx);
      setSelectedItem(detail);
    } else {
      window.open(item.url, '_blank', 'noopener');
    }
  }, [type, query, setSelectedItem]);

  const isGridLayout = type === 'image' || type === 'video';

  const handleMediaSelect = useCallback((item: ResultMeta | null) => {
    if (!item) {
      setSelectedItem(null);
      return;
    }
    
    // 「すべて」タブ (web) の場合は、いかなる場合も直接リンクを開く
    if (type === 'web') {
      window.open(item.url, '_blank', 'noopener');
      return;
    }

    // ニュースタブかつMarkdown変換が有効ならビューアーへ
    if (type === 'news' && expNewsMarkdown) {
      triggerHaptic();
      navigate(`/markdown-viewer?url=${encodeURIComponent(item.url || '')}`);
      return;
    }

    const isEmbeddable = item.url?.includes('youtube.com') || item.url?.includes('youtu.be') || item.url?.includes('vimeo.com');
    if (type === 'video' && isEmbeddable) {
      setActiveVideo(item);
    } else {
      setSelectedItem(item as ResultDetail);
    }
  }, [type, expNewsMarkdown, navigate, setSelectedItem, setActiveVideo]);

  const showAiSummary   = expAiSummary && !!geminiApiKey && type === 'web' && !isInitialLoading && results.length > 0;
  const showKnowledge   = expKnowledgePanel && type === 'web' && !!query;
  const useMerged       = expMergedAiPanel && showAiSummary && showKnowledge;

  return (
    <Box sx={{ width: '100%', contain: 'layout' }}>
      {(expViewDensity || expFocusMode) && !isInitialLoading && results.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2 }}>
          {expFocusMode && (
            <Button size="small" variant="outlined" startIcon={<FocusIcon />} onClick={() => openFocusMode(0)} sx={{ borderRadius: '12px' }}>
              Focus Mode
            </Button>
          )}
          {expViewDensity && type === 'web' && (
            <ToggleButtonGroup
              value={viewDensity}
              exclusive
              onChange={(_, v) => { if(v) setViewDensity(v); }}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="comfortable"><ComfortableIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="compact"><CompactIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="list"><ListDensityIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      )}

      {isGridLayout ? (
        <MediaGrid isLoading={isInitialLoading} results={results} onSelect={handleMediaSelect} onFocusMode={openFocusMode} onPeek={expPeekAndPop ? setPeekItem : undefined} />
      ) : (
        <Box sx={{ display: 'flex', gap: { xs: 0, md: '32px' }, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 750 }}>
            {expQueryExpansion && !isInitialLoading && query && <QueryExpansionChips query={query} />}
            {useMerged && <MergedAiPanel query={query} results={results} />}
            {showAiSummary && !useMerged && <AiSummaryCard query={query} results={results} />}
            {showKnowledge && isMobile && !useMerged && <KnowledgePanel query={query} mobile />}

            {isInitialLoading
              ? LIST_SKELETON_KEYS.map((i) => <LoadingSkeleton key={i} isDark={isDark} />)
              : results.length > 0
                ? results.slice(0, visibleCount).map((item, i) => (
                    <ResultItem 
                      key={i} item={item} query={query} type={type} index={i} settings={itemSettings}
                      onToast={setToast} onMiniBrowser={setMiniBrowserUrl} onFocusMode={openFocusMode}
                      onPeek={expPeekAndPop ? setPeekItem : undefined}
                      onSelect={handleMediaSelect}
                    />
                  ))
                : (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>{t.noResults}</Typography>
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

          <Box sx={{ width: 320, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
            <Box sx={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {showKnowledge && !isMobile && !useMerged && <KnowledgePanel query={query} />}
              <RelatedSearchesCard query={query} />
            </Box>
          </Box>
        </Box>
      )}

      <PreviewDialog selectedItem={selectedItem} setSelectedItem={setSelectedItem} t={t} />
      <MiniBrowserDialog url={miniBrowserUrl} onClose={() => setMiniBrowserUrl(null)} />
      {expFocusMode && <FocusModeDialog open={focusModeOpen} results={results} initialIndex={focusIndex} onClose={() => setFocusModeOpen(false)} type={type} />}
      <PeekAndPop item={peekItem} onClose={() => setPeekItem(null)} onConfirm={handlePeekConfirm} />
      <VideoPlayerDialog item={activeVideo} onClose={() => setActiveVideo(null)} relatedResults={results} onSelectRelated={setActiveVideo} />

      <Snackbar
        open={!!toast} autoHideDuration={2200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '12px', fontWeight: 500 }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchResults;
