import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

const FeaturesCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <InfoIcon color="info" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '新機能のお知らせ' : 'New Features'}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {language === 'ja' ? 'AIによる検索結果の要約やコンテキストメモリが利用可能になりました。Labsから有効にしてください。' : 'AI-powered search summaries and Context Memory are now available. Enable them in Labs.'}
      </Typography>
    </Paper>
  );
};
export default FeaturesCard;
