import React, { useState, useCallback, useRef, memo, useEffect, useMemo } from 'react';
import { 
  Paper, InputBase, IconButton, Box, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, ClickAwayListener, 
  Divider, Button, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  SearchOutlined as SearchIcon, 
  MicOutlined as MicIcon, 
  HistoryOutlined as HistoryIcon, 
  ClearOutlined as ClearIcon,
  TuneOutlined as TuneIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { addHistory, getHistory, removeHistory, clearHistory } from '@yunfie/search-js';
import { API_BASE } from '../config';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import FullScreenSearchDialog from './FullScreenSearchDialog';
import AdvancedSearchDialog from './AdvancedSearchDialog';

const SuggestionItem = memo(({ title, isHistory, onSelect, onRemove }: any) => (
  <ListItem 
    disablePadding
    secondaryAction={
      isHistory && (
        <IconButton edge="end" size="small" onClick={(e) => onRemove(e, title)}>
          <ClearIcon fontSize="inherit" />
        </IconButton>
      )
    }
  >
    <ListItemButton onClick={() => onSelect(title)} sx={{ py: 0.5, minHeight: 44 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        {isHistory ? <HistoryIcon fontSize="small" color="action" /> : <SearchIcon fontSize="small" color="action" />}
      </ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={{ fontSize: '14px', noWrap: true }} />
    </ListItemButton>
  </ListItem>
));

const SearchBox: React.FC<{ variant?: 'header' | 'home' }> = ({ variant = 'header' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const language   = useSearchStore((s) => s.language);
  const saveHistory = useSearchStore((s) => s.saveHistory);
  // language が変わった時だけ再計算
  const t = useMemo(() => translations[language], [language]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  
  const [suggestions, setSuggestions] = useState<{ title: string; isHistory: boolean }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const latestQueryRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHome = variant === 'home';

  const handleSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    if (saveHistory) {
      addHistory(q, searchParams.get('t') || 'web');
    }
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    setInputValue(q);
    if (inputRef.current) inputRef.current.value = q;
    navigate(`/search?q=${encodeURIComponent(q)}&t=${searchParams.get('t') || 'web'}`);
  }, [navigate, searchParams, saveHistory]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputValue(q);
    if (inputRef.current) {
      inputRef.current.value = q;
    }
  }, [searchParams]);

  const triggerSuggest = useCallback(async (val: string) => {
    setInputValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    latestQueryRef.current = val;

    if (!val.trim()) {
      const history = getHistory();
      setSuggestions(history.map(h => ({ title: h.q, isHistory: true })).slice(0, 8));
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const url = `${API_BASE}/search?q=${encodeURIComponent(val)}&type=suggest`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        
        if (response.ok && val === latestQueryRef.current) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (data.results || data.items || []);
          
          const formatted = items.slice(0, 8).map((it: any) => ({
            title: typeof it === 'string' ? it : (it.title || it.text || ''),
            isHistory: false
          }));
          
          setSuggestions(formatted);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Safe suggest fail:', err);
      }
    }, 200);
  }, []);

  const handleRemoveHistory = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeHistory(q);
    const history = getHistory();
    setSuggestions(history.map(h => ({ title: h.q, isHistory: true })).slice(0, 8));
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ClickAwayListener onClickAway={() => { setShowDropdown(false); setIsFocused(false); }}>
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: isHome ? '6px 12px' : '2px 4px',
              display: 'flex', 
              alignItems: 'center',
              borderRadius: (!isMobile && showDropdown && suggestions.length > 0) ? '24px 24px 0 0' : '24px',
              border: '1px solid',
              borderColor: isFocused ? 'primary.main' : (isDark ? 'rgba(255,255,255,0.2)' : '#dfe1e5'),
              backgroundColor: 'background.paper',
              boxShadow: isFocused 
                ? '0 2px 8px rgba(0,0,0,0.15)' 
                : (isHome ? '0 1px 6px rgba(32,33,36,0.1)' : 'none'),
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                boxShadow: '0 1px 6px rgba(32,33,36,0.2)', 
                borderColor: isFocused ? 'primary.main' : (isDark ? 'rgba(255,255,255,0.3)' : '#dadce0')
              }
            }}
          >
            <IconButton 
              sx={{ p: '10px', color: 'text.secondary' }} 
              onClick={() => isMobile ? setIsMobileSearchOpen(true) : handleSearch(inputRef.current?.value || '')}
            >
              <SearchIcon />
            </IconButton>
            <InputBase
              inputRef={inputRef}
              defaultValue={inputValue}
              sx={{ 
                ml: 1, 
                flex: 1, 
                fontSize: isHome ? '1.1rem' : '1rem', 
                color: 'text.primary',
                '& input::placeholder': {
                  color: isDark ? 'rgba(255,255,255,0.5)' : '#757575',
                  opacity: 1
                }
              }}
              placeholder={t.placeholder}
              onChange={(e) => triggerSuggest(e.target.value)}
              onFocus={() => {
                if (isMobile) {
                  setIsMobileSearchOpen(true);
                } else {
                  setIsFocused(true);
                  triggerSuggest(inputRef.current?.value || '');
                  setShowDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isMobile) {
                  handleSearch(inputRef.current?.value || '');
                }
              }}
              readOnly={isMobile}
              onClick={() => isMobile && setIsMobileSearchOpen(true)}
            />
            
            {(!isMobile && inputValue) && (
              <IconButton 
                size="small" 
                sx={{ p: '10px', color: 'text.secondary' }} 
                onClick={() => { 
                  if (inputRef.current) inputRef.current.value = ''; 
                  setInputValue('');
                  triggerSuggest(''); 
                  setShowDropdown(false); 
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}

            <Divider sx={{ height: 24, m: 1, alignSelf: 'center' }} orientation="vertical" />

            <IconButton 
              sx={{ p: '10px', color: 'text.secondary' }} 
              onClick={() => setIsAdvancedOpen(true)}
              title={language === 'ja' ? '詳細検索' : 'Advanced Search'}
            >
              <TuneIcon />
            </IconButton>
            
            <IconButton 
              sx={{ p: '10px', color: '#4285f4' }} 
              onClick={() => isMobile && setIsMobileSearchOpen(true)}
            >
              <MicIcon />
            </IconButton>
          </Paper>

          {!isMobile && showDropdown && suggestions.length > 0 && (
            <Paper 
              elevation={4} 
              sx={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                borderRadius: '0 0 24px 24px', 
                overflow: 'hidden', 
                zIndex: 9999, 
                border: '1px solid', 
                borderColor: isFocused ? 'primary.main' : 'divider', 
                borderTop: 'none', 
                backgroundColor: 'background.paper',
                boxShadow: '0 4px 6px rgba(32,33,36,0.2)'
              }}
            >
              <Divider />
              <List sx={{ py: 1 }}>
                {suggestions.map((item, index) => (
                  <SuggestionItem key={`${item.title}-${index}`} title={item.title} isHistory={item.isHistory} onSelect={handleSearch} onRemove={handleRemoveHistory} />
                ))}
              </List>
              {suggestions.some(s => s.isHistory) && (
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => { clearHistory(); triggerSuggest(''); }} sx={{ textTransform: 'none', color: 'text.secondary' }}>{t.clearHistory}</Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

      <FullScreenSearchDialog 
        open={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        onSearch={handleSearch}
        initialValue={inputRef.current?.value || ''}
      />

      <AdvancedSearchDialog
        open={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        onSearch={handleSearch}
        baseQuery={inputValue}
      />
    </Box>
  );
};

export default memo(SearchBox);
