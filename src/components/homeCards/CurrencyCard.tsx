import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Skeleton } from '@mui/material';
import { CurrencyExchangeOutlined as CurrencyIcon, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useSearchStore } from '../../store/useSearchStore';

interface Rate {
  currency: string;
  value: number;
  change: number; // For demo, we might not get historical without another call, but let's mock the change or fetch it if frankfurter supports it easily. Frankfurter /latest doesn't give change. We will just fetch latest.
}

const CurrencyCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch current
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY,EUR,GBP,CNY');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        // Fetch yesterday to calculate change
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2); // Use -2 to be safe with weekends/holidays for a rough demo diff
        const dateStr = yesterday.toISOString().split('T')[0];
        
        let oldRates: any = {};
        try {
           const oldRes = await fetch(`https://api.frankfurter.app/${dateStr}?from=USD&to=JPY,EUR,GBP,CNY`);
           if (oldRes.ok) {
             const oldData = await oldRes.json();
             oldRates = oldData.rates;
           }
        } catch { }

        const parsed: Rate[] = Object.keys(data.rates).map(curr => {
           const val = data.rates[curr];
           const oldVal = oldRates[curr];
           const change = oldVal ? val - oldVal : 0;
           return { currency: curr, value: val, change };
        });

        if (isMounted) setRates(parsed);
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRates();
    return () => { isMounted = false; };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CurrencyIcon color="success" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            {language === 'ja' ? '為替レート (USD)' : 'Exchange Rates (USD)'}
          </Typography>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton height={20} />
          <Skeleton height={20} />
        </Box>
      ) : error || rates.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {language === 'ja' ? '情報を取得できませんでした。' : 'Failed to load info.'}
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {rates.map((rate) => {
            const isUp = rate.change > 0;
            const isDown = rate.change < 0;
            const trendColor = isUp ? 'success.main' : isDown ? 'error.main' : 'text.secondary';

            return (
              <Box key={rate.currency} sx={{ display: 'flex', flexDirection: 'column', p: 1, borderRadius: '8px', bgcolor: 'background.default' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{rate.currency}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                  <Typography variant="body2" fontWeight={700}>{rate.value.toFixed(2)}</Typography>
                  {rate.change !== 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor }}>
                      {isUp ? <ArrowDropUp sx={{ fontSize: 16, mr: -0.5 }} /> : <ArrowDropDown sx={{ fontSize: 16, mr: -0.5 }} />}
                      <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 700 }}>
                        {Math.abs(rate.change).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default CurrencyCard;
