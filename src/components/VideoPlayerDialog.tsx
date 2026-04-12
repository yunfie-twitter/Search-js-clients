import React, { useMemo, memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Button,
  Avatar, List, ListItem, ListItemText, Container, Divider,
  useTheme, useMediaQuery, Portal
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  OpenInNew as OpenNewIcon,
  ShareOutlined as ShareIcon,
  KeyboardArrowDown as MinimizeIcon,
} from '@mui/icons-material';
import { ResultMeta } from '@yunfie/search-js';
import { triggerHaptic } from '../utils/haptics';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';

interface VideoPlayerProps {
  item: ResultMeta | null;
  onClose: () => void;
  relatedResults?: ResultMeta[];
  onSelectRelated?: (item: ResultMeta) => void;
}

const VideoPlayerDialog: React.FC<VideoPlayerProps> = ({ item, onClose, relatedResults = [], onSelectRelated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    isVideoMinimized, setVideoMinimized,
    videoPosition, setVideoPosition,
    expUseInvidious, invidiousInstance, customInvidiousUrl
  } = useSearchStore(useShallow(s => ({ isVideoMinimized: s.isVideoMinimized, setVideoMinimized: s.setVideoMinimized, videoPosition: s.videoPosition, setVideoPosition: s.setVideoPosition, expUseInvidious: s.expUseInvidious, invidiousInstance: s.invidiousInstance, customInvidiousUrl: s.customInvidiousUrl })));

  const [dragOffset, setDragOffset] = useState(0);
  const [isGesturing, setIsGesturing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const startY = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  /**
   * YouTube や動画サイトのURLを解析して埋め込み用URLを生成
   */
  const embedUrl = useMemo(() => {
    if (!item) return null;
    const url = item.url;
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&"'>]+)/);
    if (ytMatch) {
      const vid = ytMatch[1];
      if (expUseInvidious) {
        const base = invidiousInstance === 'custom' ? customInvidiousUrl : invidiousInstance;
        // 末尾のスラッシュ調整
        const cleanBase = base.endsWith('/') ? base : `${base}/`;
        return `${cleanBase}embed/${vid}?autoplay=1`;
      }
      return `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    return null;
  }, [item, expUseInvidious, invidiousInstance, customInvidiousUrl]);

  // ─── ジェスチャーハンドラ ───
  const handleGestureStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isVideoMinimized) {
      // ミニプレイヤー移動の開始
      startPos.current = { x: clientX - videoPosition.x, y: clientY - videoPosition.y };
      setIsMoving(true);
    } else {
      // ミニマイズスワイプの開始
      startY.current = clientY;
      setIsGesturing(true);
    }
  };

  const handleGestureMove = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isMoving && isVideoMinimized) {
      let nextX = clientX - startPos.current.x;
      let nextY = clientY - startPos.current.y;

      // ウィンドウサイズに基づいて移動可能範囲を制限
      // (ここでは単純化のため、極端な移動のみを制限)
      const maxX = (window.innerWidth / 2);
      const minX = -(window.innerWidth / 2);
      const maxY = (window.innerHeight / 2);
      const minY = -(window.innerHeight / 2);

      setVideoPosition({ 
        x: Math.max(minX, Math.min(nextX, maxX)), 
        y: Math.max(minY, Math.min(nextY, maxY)) 
      });
    } else if (isGesturing && !isVideoMinimized) {
      const delta = clientY - startY.current;
      if (delta > 0) setDragOffset(delta);
    }
  };

  const handleGestureEnd = () => {
    if (isMoving) {
      setIsMoving(false);
    } else if (isGesturing) {
      setIsGesturing(false);
      if (dragOffset > 150) {
        setVideoMinimized(true);
        triggerHaptic();
      }
      setDragOffset(0);
    }
  };

  const toggleMinimize = useCallback(() => {
    setVideoMinimized(!isVideoMinimized);
    triggerHaptic();
  }, [isVideoMinimized, setVideoMinimized]);

  useEffect(() => {
    if (!item) {
      setVideoMinimized(false);
      setVideoPosition({ x: 0, y: 0 });
    }
  }, [item, setVideoMinimized, setVideoPosition]);

  if (!item) return null;

  // ミニプレイヤーのスタイル
  const minimizedSx = {
    position: 'fixed',
    bottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 80px)' : 24,
    right: 16,
    width: isMobile ? 160 : 300,
    height: isMobile ? 90 : 169,
    zIndex: 2500,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
    bgcolor: '#000',
    cursor: isMoving ? 'grabbing' : 'grab',
    transition: isMoving ? 'none' : 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
    transform: `translate(${videoPosition.x}px, ${videoPosition.y}px)`,
    touchAction: 'none',
    '&:hover .pm-mini-overlay': { opacity: 1 }
  };

  // フルスクリーン
  const fullscreenSx = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2500,
    bgcolor: '#000',
    display: 'flex',
    flexDirection: 'column',
    transition: isGesturing ? 'none' : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
    transform: `translateY(${dragOffset}px) scale(${1 - (dragOffset / 2000)})`,
    opacity: 1 - (dragOffset / 1000),
  };

  return (
    <Portal>
      <Box 
        ref={playerRef}
        sx={isVideoMinimized ? minimizedSx : fullscreenSx} 
        onMouseDown={handleGestureStart}
        onMouseMove={handleGestureMove}
        onMouseUp={handleGestureEnd}
        onMouseLeave={handleGestureEnd}
        onTouchStart={handleGestureStart}
        onTouchMove={handleGestureMove}
        onTouchEnd={handleGestureEnd}
      >
        {/* ── ミニプレイヤー時 ── */}
        {isVideoMinimized && (
          <Box 
            className="pm-mini-overlay" 
            sx={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              bgcolor: 'rgba(0,0,0,0.4)', zIndex: 5, opacity: 0, transition: 'opacity 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2
            }}
            onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
          >
            <IconButton onClick={(e) => { e.stopPropagation(); onClose(); }} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* ── 上部バー (フルスクリーン) ── */}
        {!isVideoMinimized && (
          <Box sx={{ 
            height: 56, display: 'flex', alignItems: 'center', px: 2, justifyContent: 'space-between',
            zIndex: 10, cursor: 'ns-resize'
          }}>
            <IconButton onClick={toggleMinimize} sx={{ color: '#fff' }}><MinimizeIcon /></IconButton>
            <Box sx={{ width: 32, height: 32, bgcolor: '#007aff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
          </Box>
        )}

        {/* ── 動画エリア ── */}
        <Box sx={{ 
          width: '100%', aspectRatio: '16/9', position: 'relative', bgcolor: '#1a1a1c',
          flexShrink: 0, pointerEvents: isVideoMinimized ? 'none' : 'auto'
        }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen title={item.title}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component="img" src={(item as any).thumbnail} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              <Box sx={{ position: 'absolute', width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                <PlayIcon sx={{ fontSize: 40, ml: 0.5, color: '#fff' }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* ── 詳細 (フルスクリーン) ── */}
        {!isVideoMinimized && (
          <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', bgcolor: '#000' }}>
            <Container maxWidth="md" sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#fff' }}>{item.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ width: 32, height: 32 }}>{item.title?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>YouTube • {(item as any).author || 'Channel'}</Typography>
                  <Typography variant="caption" sx={{ color: '#aaa' }}>{(item as any).views || '1.2M views'} • {(item as any).date || 'Today'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                <Button variant="contained" startIcon={<OpenNewIcon />} component="a" href={item.url} target="_blank"
                  sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', textTransform: 'none', px: 3 }}>サイトを開く</Button>
                <Button variant="contained" startIcon={<ShareIcon />} onClick={() => navigator.share?.({ title: item.title, url: item.url })}
                  sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', textTransform: 'none', px: 3 }}>共有</Button>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>関連動画</Typography>
              <List sx={{ p: 0 }}>
                {relatedResults.slice(0, 10).map((rel, idx) => (
                  <ListItem key={idx} onClick={() => { triggerHaptic(); onSelectRelated?.(rel); }} sx={{ px: 0, py: 1.5, cursor: 'pointer' }}>
                    <Box sx={{ position: 'relative', width: 120, height: 68, flexShrink: 0, mr: 2 }}>
                      <Box component="img" src={(rel as any).thumbnail} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    </Box>
                    <ListItemText primary={rel.title} secondary={(rel as any).author} primaryTypographyProps={{ color: '#fff', variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ color: '#aaa' }} />
                  </ListItem>
                ))}
              </List>
            </Container>
          </Box>
        )}
      </Box>
    </Portal>
  );
};

export default memo(VideoPlayerDialog);
