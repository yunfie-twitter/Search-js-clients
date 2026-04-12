import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { PublicOutlined as GlobeIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

interface Clock {
  label: string;
  time: string;
  date: string;
}

const WorldClockCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const worldClocks = useSearchStore((s) => s.worldClocks);
  const [clocks, setClocks] = useState<Clock[]>([]);

  useEffect(() => {
    if (!worldClocks || worldClocks.length === 0) return;

    const updateClocks = () => {
      const now = new Date();
      const parsed = worldClocks.slice(0, 3).map(tz => {
        let label = tz.split('/')[1]?.replace('_', ' ') || tz;
        let time = '';
        let date = '';
        try {
           const formatterTime = new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
             timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
           });
           const formatterDate = new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
             timeZone: tz, month: 'short', day: 'numeric', weekday: 'short'
           });
           time = formatterTime.format(now);
           date = formatterDate.format(now);
        } catch (e) {
           time = '--:--';
           date = 'Error';
        }
        return { label, time, date };
      });
      setClocks(parsed);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [worldClocks, language]);

  if (!worldClocks || worldClocks.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <GlobeIcon color="info" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? '世界時計' : 'World Clock'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {clocks.map((clock, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>{clock.label}</Typography>
              <Typography variant="caption" color="text.secondary">{clock.date}</Typography>
            </Box>
            <Typography variant="h5" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
              {clock.time}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default WorldClockCard;
