import React from 'react';
import { Breadcrumbs, Typography, Box, Avatar } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface ItemBreadcrumbURLProps {
  url: string;
  favicon?: string;
}

const ItemBreadcrumbURL: React.FC<ItemBreadcrumbURLProps> = ({ url, favicon }) => {
  const getBreadcrumbs = (urlStr: string) => {
    try {
      const urlObj = new URL(urlStr);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
      return [hostname, ...pathParts];
    } catch (e) {
      return [urlStr];
    }
  };

  const parts = getBreadcrumbs(url);
  const faviconUrl = favicon || `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url || 'http://localhost').hostname}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: '4px' }}>
      <Avatar 
        src={faviconUrl} 
        sx={{ width: 16, height: 16, mr: 1, backgroundColor: 'transparent' }} 
        variant="square"
      >
        <Box sx={{ width: 12, height: 12, backgroundColor: '#ccc', borderRadius: '2px' }} />
      </Avatar>
      <Breadcrumbs 
        separator="›" 
        sx={{ 
          '& .MuiBreadcrumbs-separator': { 
            mx: '4px', 
            color: '#70757a',
            fontSize: '14px'
          },
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
            overflow: 'hidden'
          }
        }}
      >
        {parts.map((part, index) => (
          <Typography 
            key={index} 
            sx={{ 
              fontSize: '12px', 
              color: index === 0 ? '#202124' : '#4d5156',
              whiteSpace: 'nowrap',
              maxWidth: index === 0 ? 'none' : '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {part}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );
};

export default ItemBreadcrumbURL;
