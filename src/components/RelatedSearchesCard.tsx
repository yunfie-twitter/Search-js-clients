import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Card, styled } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSuggest } from '@yunfie/search-js';

const StyledCard = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  border: '1px solid #ebebeb',
  borderRadius: '8px',
  backgroundColor: '#ffffff'
}));

interface RelatedSearchesCardProps {
  query: string;
}

const RelatedSearchesCard: React.FC<RelatedSearchesCardProps> = ({ query }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

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
    <StyledCard>
      <Typography variant="subtitle2" sx={{ fontSize: '16px', fontWeight: 500, mb: 1, color: '#202124' }}>
        関連する検索キーワード
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
              '&:hover': {
                backgroundColor: '#f1f3f4'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SearchIcon sx={{ fontSize: '18px', color: '#70757a' }} />
            </ListItemIcon>
            <ListItemText 
              primary={text} 
              primaryTypographyProps={{ 
                fontSize: '14px', 
                color: '#1a0dab',
                sx: { '&:hover': { textDecoration: 'underline' } }
              }} 
            />
          </ListItemButton>
        ))}
      </List>
    </StyledCard>
  );
};

export default RelatedSearchesCard;
