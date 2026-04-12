import React, { useState, useEffect, useRef } from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { QrCodeScannerOutlined as QrIcon } from '@mui/icons-material';
import jsQR from 'jsqr';
import { useSearchStore } from '../../store/useSearchStore';

const QrCard: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const setQuery = useSearchStore((s) => s.setQuery);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let animationId: number;

    const tick = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

          if (code) {
             const data = code.data;
             if (data.startsWith('http')) {
               window.location.href = data;
             } else {
               setQuery(data);
             }
             stopScan();
             return;
          }
        }
      }
      if (scanning) {
        animationId = requestAnimationFrame(tick);
      }
    };

    if (scanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.play();
            animationId = requestAnimationFrame(tick);
          }
        })
        .catch(err => {
          console.error("Camera access denied", err);
          setScanning(false);
        });
    }

    return () => {
      cancelAnimationFrame(animationId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [scanning, setQuery]);

  const stopScan = () => setScanning(false);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <QrIcon color="success" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          {language === 'ja' ? 'QR コード検索' : 'QR Scanner'}
        </Typography>
      </Box>

      {scanning ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', width: '100%', height: 150, overflow: 'hidden', borderRadius: '8px', bgcolor: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
          <Button size="small" variant="outlined" onClick={stopScan} sx={{ mt: 1, borderRadius: '10px' }}>
            {language === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
           <Typography variant="body2" color="text.secondary" textAlign="center">
             {language === 'ja' ? 'カメラを起動してQRコードをスキャンします' : 'Launch camera to scan QR codes.'}
           </Typography>
           <Button variant="contained" size="small" onClick={() => setScanning(true)} sx={{ borderRadius: '10px', boxShadow: 'none' }}>
             {language === 'ja' ? 'スキャン開始' : 'Start Scan'}
           </Button>
        </Box>
      )}
    </Paper>
  );
};

export default QrCard;