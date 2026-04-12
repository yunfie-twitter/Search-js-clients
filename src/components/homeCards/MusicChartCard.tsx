import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton, Link, Avatar } from '@mui/material';
import { MusicNoteOutlined as MusicIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

interface Song {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100: string;
  url: string;
}

const MusicChartCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMusic = async () => {
      try {
        const res = await fetch('https://rss.applemarketingtools.com/api/v2/jp/music/top-songs/5/songs.json');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (isMounted) setSongs(data.feed.results || []);
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMusic();
    return () => { isMounted = false; };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <MusicIcon color="secondary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '音楽チャート (TOP 5)' : 'Music Chart (TOP 5)'}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={14} width="50%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : error || songs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {language === 'ja' ? '情報を取得できませんでした。' : 'Failed to load info.'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', flex: 1, pr: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {songs.map((song, i) => (
            <Box key={song.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 12 }}>{i + 1}</Typography>
              <Avatar src={song.artworkUrl100} variant="rounded" sx={{ width: 36, height: 36, borderRadius: '8px' }} />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Link href={song.url} target="_blank" rel="noopener" underline="hover" color="text.primary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px', fontWeight: 600 }}>
                  {song.name}
                </Link>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artistName}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default MusicChartCard;
