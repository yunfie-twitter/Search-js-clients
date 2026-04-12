import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton } from '@mui/material';
import { AutoAwesomeOutlined as AiIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';
import { generateGeminiContent } from '../../utils/gemini';

const AiTopicCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const geminiApiKey = useSearchStore((s) => s.geminiApiKey);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!geminiApiKey) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchTopic = async () => {
      const cached = localStorage.getItem('ai_topic_cache');
      const lastUpdate = localStorage.getItem('ai_topic_date');
      const now = new Date().getTime();
      
      // Update once a day
      if (cached && lastUpdate && now - parseInt(lastUpdate, 10) < 1000 * 60 * 60 * 24) {
        if (isMounted) {
          setTopic(cached);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const prompt = language === 'ja'
          ? `今日の豆知識を1つ日本語で、100文字以内で教えてください。`
          : `Give me one random interesting fact for today in under 100 characters.`;
        
        const result = await generateGeminiContent(prompt, geminiApiKey);
        if (isMounted && result) {
          setTopic(result);
          localStorage.setItem('ai_topic_cache', result);
          localStorage.setItem('ai_topic_date', now.toString());
        }
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopic();
    return () => { isMounted = false; };
  }, [geminiApiKey, language]);

  if (!geminiApiKey && !topic) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AiIcon color="secondary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? 'デイリー AI トピック' : 'Daily AI Topic'}
        </Typography>
      </Box>
      {loading ? (
        <Box>
          <Skeleton height={20} sx={{ mb: 0.5 }} />
          <Skeleton height={20} width="80%" />
        </Box>
      ) : error || !topic ? (
        <Typography variant="body2" color="text.secondary">
          {language === 'ja' ? 'トピックを取得できませんでした。' : 'Failed to load topic.'}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {topic}
        </Typography>
      )}
    </Paper>
  );
};

export default AiTopicCard;
