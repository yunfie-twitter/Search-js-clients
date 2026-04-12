import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton, Link } from '@mui/material';
import { SubscriptionsOutlined as FollowIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';
import { createPager } from '@yunfie/search-js';

interface TopicItem {
  title: string;
  link: string;
}

const TopicFollowCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const searchLang = useSearchStore((s) => s.searchLang);
  // Hardcoded for demo, could be moved to store
  const followedTopic = language === 'ja' ? 'React' : 'React.js';
  const [items, setItems] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTopic = async () => {
      setLoading(true);
      setError(false);
      try {
        const pager = createPager({ q: followedTopic, type: 'news', lang: searchLang }, 3);
        const res = await pager.next();
        
        if (res && res.ok && isMounted) {
           const data = res.data as any;
           const results = Array.isArray(data) ? data : (data?.results || []);
           const parsed = results.slice(0, 3).map((r: any) => ({
             title: r.title,
             link: r.url
           }));
           setItems(parsed);
        } else if (isMounted) {
           setError(true);
        }
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopic();
    return () => { isMounted = false; };
  }, [followedTopic, searchLang]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <FollowIcon color="info" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? `トピック: ${followedTopic}` : `Topic: ${followedTopic}`}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
        </Box>
      ) : error || items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {language === 'ja' ? '最新のニュースがありません。' : 'No recent news found.'}
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

export default TopicFollowCard;
