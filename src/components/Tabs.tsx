import React from 'react';
import { Tabs as MuiTabs, Tab, Box } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchType } from '@yunfie/search-js';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

import { triggerHaptic } from '../utils/haptics';

const Tabs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, type, setType, enableAnimations } = useSearchStore();
  const t = translations[language];

  const query = searchParams.get('q') || '';

  const handleChange = (event: React.SyntheticEvent, newValue: SearchType) => {
    triggerHaptic();
    setType(newValue);
    navigate(`/search?q=${encodeURIComponent(query)}&t=${newValue}`, { replace: true });
  };

  return (
    <Box sx={{ width: '100%', borderBottom: 'none' }}>
      <MuiTabs 
        value={type} 
        onChange={handleChange} 
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 40,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            transition: enableAnimations ? undefined : 'none'
          },
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: { xs: 2, md: 2 },
            mr: 1,
            fontSize: '14px',
            textTransform: 'none',
            minHeight: 40,
            paddingBottom: '12px',
            transition: enableAnimations ? undefined : 'none'
          }
        }}
      >
        <Tab label={t.all} value="web" />
        <Tab label={t.images} value="image" />
        <Tab label={t.videos} value="video" />
        <Tab label={t.news} value="news" />
      </MuiTabs>
    </Box>
  );
};

export default Tabs;
