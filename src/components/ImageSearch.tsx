import React, { useState, useCallback, useRef, memo } from 'react';
import {
  Box, Typography, Button, Paper,
  CircularProgress, useTheme,
} from '@mui/material';
import {
  UploadFileOutlined as UploadIcon,
  SearchOutlined as SearchIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const FAISS_BASE = 'https://faiss.wholphin.net';

export interface FaissImageResult {
  id: string | number;
  url: string;
  title?: string;
  score?: number;
}

/** APIが返す url のホスト部分を必ず faiss.wholphin.net に置換 */
export const normalizeFaissUrl = (url: string): string => {
  try {
    const u = new URL(url);
    u.protocol = 'https:';
    u.host     = 'faiss.wholphin.net';
    return u.toString();
  } catch {
    // 相対パスなどパース不可な場合は FAISS_BASE を先頭に
    return `${FAISS_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  }
};

const ImageSearch: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const t = React.useMemo(() => translations[language], [language]);
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const [previewSrc,   setPreviewSrc]   = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewSrc(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewSrc(URL.createObjectURL(file));
  }, []);

  const handleUploadSearch = useCallback(async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch(`${FAISS_BASE}/search/upload?top_k=20`, {
        method: 'POST', mode: 'cors', body: form,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data  = await res.json();
      const items: FaissImageResult[] = (Array.isArray(data)
        ? data : (data.results ?? data.items ?? []))
        .map((item: FaissImageResult) => ({
          ...item,
          url: normalizeFaissUrl(item.url),
        }));
      // 別画面に結果を渡して遷移
      navigate('/image-search', { state: { results: items, previewSrc } });
    } catch (e: any) {
      setErrorMsg(e?.message ? `${t.imageSearchError} (${e.message})` : t.imageSearchError);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, previewSrc, navigate, t]);

  const dropBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const dropBg     = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 3, px: { xs: 2, md: 0 } }}>
      <Paper
        elevation={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          borderRadius: '20px',
          border: `2px dashed ${dropBorder}`,
          backgroundColor: dropBg,
          p: 4,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 2,
          cursor: 'pointer',
          transition: 'border-color 200ms, background-color 200ms',
          '&:hover': {
            borderColor: isDark ? 'rgba(10,132,255,0.5)' : 'rgba(0,122,255,0.4)',
            backgroundColor: isDark ? 'rgba(10,132,255,0.05)' : 'rgba(0,122,255,0.03)',
          },
        }}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef} type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {previewSrc ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              component="img" src={previewSrc} alt="preview"
              sx={{ maxHeight: 240, maxWidth: '100%', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined" size="small"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                sx={{ borderRadius: '10px', textTransform: 'none', fontSize: '13px' }}
              >
                {t.imageSearchSelectFile}
              </Button>
              <Button
                variant="contained" size="small"
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SearchIcon />}
                onClick={(e) => { e.stopPropagation(); handleUploadSearch(); }}
                disabled={loading}
                sx={{ borderRadius: '10px', textTransform: 'none', fontSize: '13px', minWidth: 100 }}
              >
                {loading ? '検索中...' : t.imageSearchSearch}
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{
              width: 64, height: 64, borderRadius: '18px',
              backgroundColor: isDark ? 'rgba(10,132,255,0.18)' : 'rgba(0,122,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UploadIcon sx={{ fontSize: 32, color: isDark ? '#0a84ff' : '#007aff' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>
              {language === 'ja' ? '画像をドロップまたは選択' : 'Drop or select an image'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '13px' }}>
              {language === 'ja'
                ? 'faiss.wholphin.net のインデックスから類似画像を検索します'
                : 'Finds similar images from the faiss.wholphin.net index'}
            </Typography>
            <Button
              variant="outlined" size="small" startIcon={<UploadIcon />}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              sx={{ borderRadius: '10px', textTransform: 'none', mt: 1 }}
            >
              {t.imageSearchSelectFile}
            </Button>
          </>
        )}
      </Paper>

      <Dialog open={!!errorMsg} onClose={() => setErrorMsg(null)}
        PaperProps={{ sx: { borderRadius: '16px', mx: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon color="error" />
          {language === 'ja' ? 'エラー' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px', lineHeight: 1.7 }}>{errorMsg}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setErrorMsg(null)} variant="contained" color="error"
            sx={{ textTransform: 'none', borderRadius: '10px' }}>
            {language === 'ja' ? '閉じる' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(ImageSearch);
