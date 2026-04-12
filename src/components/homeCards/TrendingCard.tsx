import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { TrendingUpOutlined as TrendingIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

const TrendingCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TrendingIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '急上昇の検索ワード' : 'Trending Searches'}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {language === 'ja' ? '今日の話題やニュースをチェックしましょう。' : 'Check out what people are searching for today.'}
      </Typography>
    </Paper>
  );
};
export default TrendingCard;
