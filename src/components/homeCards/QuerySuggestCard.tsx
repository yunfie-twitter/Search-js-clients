import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Chip, Skeleton } from '@mui/material';
import { TipsAndUpdatesOutlined as SuggestIcon, SearchOutlined as SearchIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';
import { getHistory } from '@yunfie/search-js';
import { generateGeminiContent } from '../../utils/gemini';
import { useNavigate } from 'react-router-dom';

const QuerySuggestCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const geminiApiKey = useSearchStore((s) => s.geminiApiKey);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!geminiApiKey) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchSuggestions = async () => {
      const cached = localStorage.getItem('query_suggest_cache');
      const lastUpdate = localStorage.getItem('query_suggest_date');
      const now = new Date().getTime();
      
      // Update once every 12 hours
      if (cached && lastUpdate && now - parseInt(lastUpdate, 10) < 1000 * 60 * 60 * 12) {
        if (isMounted) setSuggestions(JSON.parse(cached));
        return;
      }

      setLoading(true);
      try {
        const history = getHistory();
        if (history.length < 3) {
          setLoading(false);
          return;
        }

        const recent = history.slice(0, 5).map(h => h.q).join(', ');
        const prompt = language === 'ja'
          ? `ユーザーの直近の検索履歴: [${recent}]。これに基づいて、ユーザーが次に調べそうな関連性の高い検索クエリを3つ予測し、カンマ区切りで提示してください。説明は不要です。`
          : `User's recent search history: [${recent}]. Predict 3 highly relevant search queries the user might want to search next based on this. Return them separated by commas. No explanation.`;
        
        const result = await generateGeminiContent(prompt, geminiApiKey);
        if (isMounted && result) {
          const parsed = result.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
          setSuggestions(parsed);
          localStorage.setItem('query_suggest_cache', JSON.stringify(parsed));
          localStorage.setItem('query_suggest_date', now.toString());
        }
      } catch (e) {
        console.error('Suggest failed', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();
    return () => { isMounted = false; };
  }, [geminiApiKey, language]);

  if (!geminiApiKey || (!loading && suggestions.length === 0)) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <SuggestIcon color="secondary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '次は何を調べますか？' : 'Suggested Searches'}
        </Typography>
      </Box>

      {loading ? (
         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
           <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 4 }} />
           <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: 4 }} />
         </Box>
      ) : (
         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
           {suggestions.map((q, i) => (
             <Chip
               key={i}
               label={q}
               onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
               icon={<SearchIcon sx={{ fontSize: 16 }} />}
               variant="outlined"
               color="primary"
               sx={{ borderRadius: '12px', fontWeight: 500 }}
             />
           ))}
         </Box>
      )}
    </Paper>
  );
};

export default QuerySuggestCard;
