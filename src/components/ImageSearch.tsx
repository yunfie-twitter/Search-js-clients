import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  UploadFileOutlined as UploadIcon,
  OpenInNewOutlined as OpenInNewIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

const FAISS_BASE = 'https://faiss.wholphin.net';

interface ImageResult {
  id: string | number;
  url: string;
  title?: string;
  score?: number;
}

const ImageSearch: React.FC = () => {
  const language = useSearchStore((s) => s.language);
  const t = React.useMemo(() => translations[language], [language]);

  const [tab, setTab] = useState<0 | 1>(0);
  const [textQuery, setTextQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
  }, []);

  const handleTextSearch = useCallback(async () => {
    if (!textQuery.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${FAISS_BASE}/search/text`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textQuery.trim(), top_k: 20 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items: ImageResult[] = Array.isArray(data)
        ? data
        : (data.results ?? data.items ?? []);
      setResults(items);
    } catch (e: any) {
      showError(e?.message ? `${t.imageSearchError} (${e.message})` : t.imageSearchError);
    } finally {
      setLoading(false);
    }
  }, [textQuery, t, showError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewSrc(URL.createObjectURL(file));
    setResults([]);
  }, []);

  const handleUploadSearch = useCallback(async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResults([]);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch(`${FAISS_BASE}/search/upload?top_k=20`, {
        method: 'POST',
        mode: 'cors',
        body: form,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items: ImageResult[] = Array.isArray(data)
        ? data
        : (data.results ?? data.items ?? []);
      setResults(items);
    } catch (e: any) {
      showError(e?.message ? `${t.imageSearchError} (${e.message})` : t.imageSearchError);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, t, showError]);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 3, px: { xs: 2, md: 0 } }}>
      <Paper
        elevation={0}
        sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setResults([]); }}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label={t.imageSearchByText} icon={<SearchIcon fontSize="small" />} iconPosition="start" sx={{ textTransform: 'none', minHeight: 48 }} />
          <Tab label={t.imageSearchByUpload} icon={<UploadIcon fontSize="small" />} iconPosition="start" sx={{ textTransform: 'none', minHeight: 48 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t.imageSearchTextPlaceholder}
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <Button
                variant="contained"
                onClick={handleTextSearch}
                disabled={loading || !textQuery.trim()}
                sx={{ borderRadius: '10px', minWidth: 100, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : t.imageSearchSearch}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                {t.imageSearchSelectFile}
              </Button>
              {previewSrc && (
                <Box
                  component="img"
                  src={previewSrc}
                  alt="preview"
                  sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                />
              )}
              {selectedFile && (
                <Button
                  variant="contained"
                  onClick={handleUploadSearch}
                  disabled={loading}
                  sx={{ borderRadius: '10px', minWidth: 160, textTransform: 'none' }}
                >
                  {loading ? <CircularProgress size={18} color="inherit" /> : t.imageSearchSearch}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {results.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t.imageSearchResultCount.replace('{n}', String(results.length))}
          </Typography>
          <ImageList variant="masonry" cols={3} gap={8} sx={{ mt: 0 }}>
            {results.map((item, i) => (
              <ImageListItem key={item.id ?? i}>
                <img
                  src={item.url}
                  alt={item.title ?? ''}
                  loading="lazy"
                  style={{ borderRadius: 8, width: '100%', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <ImageListItemBar
                  title={item.title}
                  subtitle={item.score != null ? `score: ${item.score.toFixed(3)}` : undefined}
                  actionIcon={
                    item.url ? (
                      <Tooltip title={t.visitWebsite}>
                        <IconButton
                          size="small"
                          component="a"
                          href={item.url}
                          target="_blank"
                          rel="noopener"
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : undefined
                  }
                  sx={{ borderRadius: '0 0 8px 8px' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}

      {!loading && results.length === 0 && !errorMsg && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">{t.imageSearchEmpty}</Typography>
        </Box>
      )}

      {/* エラーモーダル */}
      <Dialog
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        PaperProps={{ sx: { borderRadius: '16px', mx: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon color="error" />
          {language === 'ja' ? 'エラー' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px', lineHeight: 1.7 }}>
            {errorMsg}
          </DialogContentText>
          {errorMsg?.includes('ERR_FAILED') || errorMsg?.includes('Failed to fetch') || errorMsg?.includes('NetworkError') ? (
            <DialogContentText sx={{ fontSize: '13px', mt: 1, color: 'text.secondary' }}>
              {language === 'ja'
                ? 'CORSポリシーまたはネットワークの問題の可能性があります。サーバー側で Access-Control-Allow-Origin ヘッダーの設定を確認してください。'
                : 'This may be a CORS policy or network issue. Check that the server returns Access-Control-Allow-Origin headers.'}
            </DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setErrorMsg(null)}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            {language === 'ja' ? '閉じる' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageSearch;
