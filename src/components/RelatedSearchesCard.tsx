import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSuggest } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

interface RelatedSearchesCardProps {
  query: string;
}

const RelatedSearchesCard: React.FC<RelatedSearchesCardProps> = ({ query }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { language } = useSearchStore();
  const t = translations[language];

  useEffect(() => {
    if (!query) return;
    const fetchSuggestions = async () => {
      const result = await getSuggest(query);
      if (result.ok && result.items) {
        setSuggestions(result.items.map(item => item.title).slice(0, 8));
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  if (suggestions.length === 0) return null;

  return (
    <Box sx={{
      mt: 2,
      p: 2,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '8px',
      backgroundColor: 'background.paper'
    }}>
      <Typography variant="subtitle2" sx={{ fontSize: '16px', fontWeight: 500, mb: 1, color: 'text.primary' }}>
        {t.relatedSearches}
      </Typography>
      <List sx={{ py: 0 }}>
        {suggestions.map((text, index) => (
          <ListItemButton
            key={index}
            onClick={() => navigate(`/search?q=${encodeURIComponent(text)}&t=web`)}
            sx={{ 
              py: 0.5, 
              px: 1, 
              borderRadius: '4px',
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SearchIcon sx={{ fontSize: '18px', color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText 
              primary={text} 
              primaryTypographyProps={{ 
                fontSize: '14px', 
                color: 'primary.main',
              }} 
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default RelatedSearchesCard;
