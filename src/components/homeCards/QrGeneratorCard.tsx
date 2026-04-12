import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, TextField } from '@mui/material';
import { QrCodeOutlined as QrIcon } from '@mui/icons-material';
import QRCode from 'qrcode';
import { useSearchStore } from '../../store/useSearchStore';

const QrGeneratorCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!text) {
      setQrUrl('');
      return;
    }
    QRCode.toDataURL(text, { width: 120, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => setQrUrl(url))
      .catch(err => console.error(err));
  }, [text]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <QrIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? 'QR 生成' : 'QR Generator'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <TextField 
          fullWidth size="small" 
          placeholder={language === 'ja' ? 'URLやテキストを入力...' : 'Enter URL or text...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& input': { fontSize: '13px' } }}
        />
        {qrUrl ? (
          <Box component="img" src={qrUrl} sx={{ width: 100, height: 100, borderRadius: '8px', boxShadow: 1 }} />
        ) : (
          <Box sx={{ width: 100, height: 100, borderRadius: '8px', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">No Data</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default QrGeneratorCard;
