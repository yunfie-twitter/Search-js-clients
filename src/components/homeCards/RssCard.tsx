import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton, Link } from '@mui/material';
import { RssFeedOutlined as RssIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

interface RssItem {
  title: string;
  link: string;
}

const RssCard: React.FC = () => {
  const { language, rssFeeds, addNotification } = useSearchStore(s => ({
    language: s.language,
    rssFeeds: s.rssFeeds,
    addNotification: s.addNotification
  }));
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!rssFeeds || rssFeeds.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchFeeds = async () => {
      setLoading(true);
      setError(false);
      try {
        const targetUrl = rssFeeds[0];
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) throw new Error('Proxy error');
        const data = await res.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');
        
        const nodes = xml.querySelectorAll('item, entry');
        const parsed: RssItem[] = Array.from(nodes).slice(0, 5).map(node => {
          const title = node.querySelector('title')?.textContent || 'No title';
          let link = node.querySelector('link')?.textContent || '';
          if (!link) link = node.querySelector('link')?.getAttribute('href') || '#';
          return { title, link: link.trim() };
        });

        if (isMounted) {
          setItems(parsed.slice(0, 3));
          
          // Check for new content
          const lastSeen = localStorage.getItem('rss_last_seen');
          if (parsed.length > 0 && lastSeen !== parsed[0].title) {
            addNotification({
              title: language === 'ja' ? '新しいニュースがあります' : 'New news available',
              message: parsed[0].title,
              type: 'rss'
            });
            localStorage.setItem('rss_last_seen', parsed[0].title);
          }
        }
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeeds();
    return () => { isMounted = false; };
  }, [rssFeeds]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <RssIcon color="warning" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? 'ニュース・フィード' : 'News Feed'}
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
          {language === 'ja' ? 'フィードを取得できませんでした。' : 'Failed to load feeds.'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, i) => (
            <Box key={i}>
              <Link href={item.link} target="_blank" rel="noopener" underline="hover" color="text.primary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
                {item.title}
              </Link>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default RssCard;
