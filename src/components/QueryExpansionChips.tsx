import React, { useState, useEffect } from 'react';
import { Box, Chip, Skeleton } from '@mui/material';
import { AutoAwesomeOutlined as AiIcon } from '@mui/icons-material';
import { generateGeminiContent } from '../utils/gemini';
import { useSearchStore } from '../store/useSearchStore';
import { useNavigate } from 'react-router-dom';

interface QueryExpansionChipsProps {
  query: string;
}

const QueryExpansionChips: React.FC<QueryExpansionChipsProps> = ({ query }) => {
  const language = useSearchStore((s) => s.language);
  const geminiApiKey = useSearchStore((s) => s.geminiApiKey);
  const [chips, setChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || !geminiApiKey) return;

    let isMounted = true;
    const fetchChips = async () => {
      setLoading(true);
      setChips([]);
      try {
        const prompt = language === 'ja'
          ? `検索クエリ「${query}」の同義語、関連語、または英語表記をカンマ区切りで3つだけ提案してください。他の説明は不要です。`
          : `Suggest exactly 3 synonyms, related terms, or alternative spellings for the search query "${query}" separated by commas. No other text.`;
        
        const result = await generateGeminiContent(prompt, geminiApiKey);
        if (isMounted && result) {
          const parsed = result.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.toLowerCase() !== query.toLowerCase()).slice(0, 3);
          setChips(parsed);
        }
      } catch (e) {
        console.error('Query expansion failed', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChips();

    return () => { isMounted = false; };
  }, [query, geminiApiKey, language]);

  if (!loading && chips.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      {loading ? (
        <>
          <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '14px' }} />
          <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '14px' }} />
        </>
      ) : (
        chips.map((chip, i) => (
          <Chip
            key={i}
            label={chip}
            icon={<AiIcon sx={{ fontSize: 14 }} />}
            onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
            size="small"
            sx={{
              fontWeight: 500,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiChip-icon': { color: 'inherit' },
              '&:hover': { backgroundColor: 'primary.dark' },
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.95)' }
            }}
          />
        ))
      )}
    </Box>
  );
};

export default QueryExpansionChips;
