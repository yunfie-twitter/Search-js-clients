import React, { useMemo } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { ConfirmationNumberOutlined as TicketIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

const FORTUNES = [
  { label: '大吉', desc: '最高の運勢！何事もうまくいくでしょう。', color: '#ff1744' },
  { label: '中吉', desc: '良い兆し。努力が実を結ぶ日です。', color: '#ff9100' },
  { label: '吉',   desc: '平穏な一日。小さな幸せを見つけられそう。', color: '#00e676' },
  { label: '小吉', desc: '焦らず一歩ずつ進めば道は開けます。', color: '#2979ff' },
  { label: '凶',   desc: '今日は慎重に。無理は禁物です。', color: '#651fff' }
];

const FORTUNES_EN = [
  { label: 'Excellent Luck', desc: 'Everything will go perfectly today!', color: '#ff1744' },
  { label: 'Good Luck', desc: 'Good signs. Your efforts will bear fruit.', color: '#ff9100' },
  { label: 'Luck', desc: 'A peaceful day. Look for small moments of happiness.', color: '#00e676' },
  { label: 'Small Luck', desc: 'Take it one step at a time without rushing.', color: '#2979ff' },
  { label: 'Bad Luck', desc: 'Be careful today. Avoid pushing yourself too hard.', color: '#651fff' }
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const OmikujiCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  
  const result = useMemo(() => {
    const today = new Date();
    // Use local timezone date strictly
    const dateString = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const seed = parseInt(dateString.replace(/-/g, ''), 10);
    
    // Add user language to seed so it feels pseudo-random but constant per day
    const rand = seededRandom(seed);
    const index = Math.floor(rand * FORTUNES.length);
    
    return language === 'ja' ? FORTUNES[index] : FORTUNES_EN[index];
  }, [language]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TicketIcon color="error" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '今日の運勢' : 'Daily Fortune'}
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 1 }}>
         <Typography variant="h4" sx={{ fontWeight: 800, color: result.color, mb: 1 }}>
           {result.label}
         </Typography>
         <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 1 }}>
           {result.desc}
         </Typography>
      </Box>
    </Paper>
  );
};

export default OmikujiCard;
