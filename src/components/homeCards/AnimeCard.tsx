import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton, Link } from '@mui/material';
import { PlayCircleOutline as PlayIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

interface AnimeItem {
  mal_id: number;
  title: string;
  url: string;
  score: number;
}

const AnimeCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnime = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('https://api.jikan.moe/v4/seasons/now');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        // Sort by score or members, usually jikan returns sorted by members or we can just take top 5
        const sorted = data.data.sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).slice(0, 5);
        if (isMounted) setItems(sorted);
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnime();
    return () => { isMounted = false; };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <PlayIcon color="error" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '今季アニメ ランキング' : 'Current Season Anime'}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} />
        </Box>
      ) : error || items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {language === 'ja' ? '情報を取得できませんでした。' : 'Failed to load info.'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1, pr: 1, '&::-webkit-scrollbar': { width: '4px' } }}>
          {items.map((item, i) => (
            <Box key={item.mal_id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 16 }}>{i + 1}.</Typography>
              <Link href={item.url} target="_blank" rel="noopener" underline="hover" color="text.primary" sx={{ flex: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '13px', fontWeight: 500 }}>
                {item.title}
              </Link>
              {item.score && (
                 <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>★{item.score}</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default AnimeCard;
