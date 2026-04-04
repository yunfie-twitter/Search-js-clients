import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const Sidebar: React.FC = () => {
  const { language } = useSearchStore();
  const t = translations[language];

  return (
    <Box sx={{ borderLeft: '1px solid #ebebeb', pl: 4, height: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <List sx={{ py: 0 }}>
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemText 
              primary={t.anyTime} 
              primaryTypographyProps={{ fontSize: '14px', color: '#70757a' }} 
            />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemText 
              primary={t.allLanguages} 
              primaryTypographyProps={{ fontSize: '14px', color: '#70757a' }} 
            />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemText 
              primary={t.global} 
              primaryTypographyProps={{ fontSize: '14px', color: '#70757a' }} 
            />
          </ListItem>
        </List>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight="normal" color="#202124" sx={{ fontSize: '16px', mb: 2 }}>
          {t.relatedSearches}
        </Typography>
        <List sx={{ py: 0 }}>
          {['TypeScript tutorial', 'React best practices', 'Material UI templates'].map((text) => (
            <ListItem key={text} disablePadding sx={{ mb: 1.5 }}>
              <ListItemText 
                primary={text} 
                primaryTypographyProps={{ 
                  fontSize: '14px', 
                  color: '#1a0dab',
                  sx: { '&:hover': { textDecoration: 'underline', cursor: 'pointer' } }
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
