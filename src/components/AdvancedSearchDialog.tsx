import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Select,
  MenuItem, FormControl, InputLabel, Divider, IconButton, Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';

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
  const language = useSearchStore(s => s.language);
  const t = translations[language];

  const [allWords, setAllWords] = useState(baseQuery);
  const [exactPhrase, setExactPhrase] = useState('');
  const [excludeWords, setExcludeWords] = useState('');
  const [site, setSite] = useState('');
  const [filetype, setFiletype] = useState('');
  const [dateRange, setDateRange] = useState('');

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
        <Typography variant="h6" fontWeight={600}>{t.advancedSearch}</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.advancedKeywords}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth size="small" label={t.advancedAllWords} value={allWords} onChange={e => setAllWords(e.target.value)} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth size="small"
              label={t.advancedExactPhrase}
              value={exactPhrase}
              onChange={e => setExactPhrase(e.target.value)}
              helperText={t.advancedExactPhraseHelp}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth size="small"
              label={t.advancedExclude}
              value={excludeWords}
              onChange={e => setExcludeWords(e.target.value)}
              helperText={t.advancedExcludeHelp}
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.advancedFilters}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth size="small"
              label={t.advancedSite}
              placeholder="e.g. github.com"
              value={site}
              onChange={e => setSite(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t.advancedFiletype}</InputLabel>
              <Select value={filetype} onChange={e => setFiletype(e.target.value)} label={t.advancedFiletype}>
                <MenuItem value="">{t.advancedFiletypeNone}</MenuItem>
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
              <InputLabel>{t.advancedDateRange}</InputLabel>
              <Select value={dateRange} onChange={e => setDateRange(e.target.value)} label={t.advancedDateRange}>
                <MenuItem value="">{t.advancedDateNone}</MenuItem>
                <MenuItem value={getDateBefore(1)}>{t.advancedDate24h}</MenuItem>
                <MenuItem value={getDateBefore(7)}>{t.advancedDateWeek}</MenuItem>
                <MenuItem value={getDateBefore(30)}>{t.advancedDateMonth}</MenuItem>
                <MenuItem value={getDateBefore(365)}>{t.advancedDateYear}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {buildQuery() && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">{t.advancedGeneratedQuery}</Typography>
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
        <Button onClick={handleClose} color="inherit">{t.advancedCancel}</Button>
        <Button variant="contained" onClick={handleSearch} disabled={!buildQuery().trim()}>{t.advancedSubmit}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSearchDialog;
