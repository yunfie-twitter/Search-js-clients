import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Select,
  MenuItem, FormControl, InputLabel, Divider, IconButton, Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  baseQuery: string;
}

function getDateBefore(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const AdvancedSearchDialog: React.FC<Props> = ({ open, onClose, onSearch, baseQuery }) => {
  const { language } = useSearchStore();
  const isJa = language === 'ja';

  const [allWords, setAllWords] = useState(baseQuery);
  const [exactPhrase, setExactPhrase] = useState('');
  const [excludeWords, setExcludeWords] = useState('');
  const [site, setSite] = useState('');
  const [filetype, setFiletype] = useState('');
  const [dateRange, setDateRange] = useState('');

  // ダイアログが開くたびに baseQuery を反映
  React.useEffect(() => {
    if (open) setAllWords(baseQuery);
  }, [open, baseQuery]);

  const buildQuery = () => {
    const parts: string[] = [];
    if (allWords.trim()) parts.push(allWords.trim());
    if (exactPhrase.trim()) parts.push(`"${exactPhrase.trim()}"`);
    if (excludeWords.trim()) {
      excludeWords.trim().split(/\s+/).forEach(w => parts.push(`-${w}`));
    }
    if (site.trim()) parts.push(`site:${site.trim()}`);
    if (filetype.trim()) parts.push(`filetype:${filetype.trim()}`);
    if (dateRange) parts.push(`after:${dateRange}`);
    return parts.join(' ');
  };

  const handleSearch = () => {
    const q = buildQuery();
    if (!q.trim()) return;
    onSearch(q);
    onClose();
  };

  const handleClose = () => {
    setExactPhrase('');
    setExcludeWords('');
    setSite('');
    setFiletype('');
    setDateRange('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          {isJa ? '詳細検索' : 'Advanced Search'}
        </Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isJa ? 'キーワード' : 'Keywords'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth size="small"
              label={isJa ? 'すべてのワード' : 'All these words'}
              value={allWords}
              onChange={e => setAllWords(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth size="small"
              label={isJa ? '完全一致フレーズ' : 'Exact phrase'}
              value={exactPhrase}
              onChange={e => setExactPhrase(e.target.value)}
              helperText={isJa ? '自動的に " " で囲まれます' : 'Wrapped in quotes automatically'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth size="small"
              label={isJa ? '除外ワード（スペース区切り）' : 'Exclude words (space separated)'}
              value={excludeWords}
              onChange={e => setExcludeWords(e.target.value)}
              helperText={isJa ? '自動的に - が付きます' : 'Prefixed with - automatically'}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isJa ? '絞り込み' : 'Filters'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small"
              label={isJa ? 'サイト指定 (site:)' : 'Specific site (site:)'}
              placeholder="e.g. github.com"
              value={site}
              onChange={e => setSite(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{isJa ? 'ファイルタイプ' : 'File type'}</InputLabel>
              <Select
                value={filetype}
                onChange={e => setFiletype(e.target.value)}
                label={isJa ? 'ファイルタイプ' : 'File type'}
              >
                <MenuItem value="">{isJa ? 'なし' : 'None'}</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="doc">DOC</MenuItem>
                <MenuItem value="xls">XLS</MenuItem>
                <MenuItem value="ppt">PPT</MenuItem>
                <MenuItem value="txt">TXT</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{isJa ? '期間' : 'Date range'}</InputLabel>
              <Select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                label={isJa ? '期間' : 'Date range'}
              >
                <MenuItem value="">{isJa ? 'なし' : 'None'}</MenuItem>
                <MenuItem value={getDateBefore(1)}>{isJa ? '過去24時間' : 'Past 24 hours'}</MenuItem>
                <MenuItem value={getDateBefore(7)}>{isJa ? '過去1週間' : 'Past week'}</MenuItem>
                <MenuItem value={getDateBefore(30)}>{isJa ? '過去1ヶ月' : 'Past month'}</MenuItem>
                <MenuItem value={getDateBefore(365)}>{isJa ? '過去1年' : 'Past year'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {buildQuery() && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {isJa ? '生成されるクエリ：' : 'Generated query: '}
              </Typography>
              <Box sx={{
                fontFamily: 'monospace', mt: 0.5, p: 1.5,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                wordBreak: 'break-all',
                fontSize: '13px'
              }}>
                {buildQuery()}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {isJa ? 'キャンセル' : 'Cancel'}
        </Button>
        <Button variant="contained" onClick={handleSearch} disabled={!buildQuery().trim()}>
          {isJa ? '検索する' : 'Search'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSearchDialog;
