import React, { useState, useCallback, useRef, memo, useEffect, useMemo } from 'react';
import {
  InputBase, IconButton, Box, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText,
  ClickAwayListener, Divider, Button, useTheme
} from '@mui/material';
import {
  SearchOutlined   as SearchIcon,
  MicOutlined      as MicIcon,
  HistoryOutlined  as HistoryIcon,
  ClearOutlined    as ClearIcon,
  TuneOutlined     as TuneIcon,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { addHistory, getHistory, removeHistory, clearHistory } from '@yunfie/search-js';
import { API_BASE } from '../config';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import FullScreenSearchDialog from './FullScreenSearchDialog';
import AdvancedSearchDialog from './AdvancedSearchDialog';
import { EASE_SPRING, DUR_FAST, DUR_NORMAL } from '../utils/motion';

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
    <ListItemButton onClick={() => onSelect(title)} sx={{ py: 0.5, minHeight: 44, borderRadius: '8px' }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        {isHistory
          ? <HistoryIcon fontSize="small" color="action" />
          : <SearchIcon  fontSize="small" color="action" />}
      </ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={{ fontSize: '14px', noWrap: true, letterSpacing: '-0.005em' }} />
    </ListItemButton>
  </ListItem>
));

const SearchBox: React.FC<{ variant?: 'header' | 'home' }> = ({ variant = 'header' }) => {
  const [searchParams] = useSearchParams();
  const navigate   = useNavigate();
  const language   = useSearchStore((s) => s.language);
  const saveHistory = useSearchStore((s) => s.saveHistory);
  const t = useMemo(() => translations[language], [language]);
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [suggestions, setSuggestions]         = useState<{ title: string; isHistory: boolean }[]>([]);
  const [showDropdown, setShowDropdown]         = useState(false);
  const [isMobileSearchOpen, setMobileOpen]     = useState(false);
  const [isAdvancedOpen, setAdvancedOpen]       = useState(false);
  const [inputValue, setInputValue]             = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused]               = useState(false);

  const inputRef       = useRef<HTMLInputElement>(null);
  const latestQueryRef = useRef('');
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHome         = variant === 'home';
  const hasDropdown    = !!(showDropdown && suggestions.length > 0);

  const handleSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    if (saveHistory) addHistory(q, searchParams.get('t') || 'web');
    setShowDropdown(false);
    setMobileOpen(false);
    setInputValue(q);
    if (inputRef.current) inputRef.current.value = q;
    navigate(`/search?q=${encodeURIComponent(q)}&t=${searchParams.get('t') || 'web'}`);
  }, [navigate, searchParams, saveHistory]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputValue(q);
    if (inputRef.current) inputRef.current.value = q;
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
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(val)}&type=suggest`, { headers: { Accept: 'application/json' } });
        if (res.ok && val === latestQueryRef.current) {
          const data  = await res.json();
          const items = (Array.isArray(data) ? data : (data.results || data.items || [])).slice(0, 8);
          setSuggestions(items.map((it: any) => ({ title: typeof it === 'string' ? it : (it.title || it.text || ''), isHistory: false })));
          setShowDropdown(true);
        }
      } catch { /* silent */ }
    }, 200);
  }, []);

  const handleRemoveHistory = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation(); e.preventDefault();
    removeHistory(q);
    setSuggestions(getHistory().map(h => ({ title: h.q, isHistory: true })).slice(0, 8));
  }, []);

  // iOS Search Bar スタイル
  const searchBarBg = isDark ? 'rgba(118,118,128,0.24)' : 'rgba(118,118,128,0.12)';
  const focusRing   = isFocused ? `0 0 0 3px ${isDark ? 'rgba(10,132,255,0.30)' : 'rgba(0,122,255,0.22)'}` : 'none';

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ClickAwayListener onClickAway={() => { setShowDropdown(false); setIsFocused(false); }}>
        <Box>
          {/* Search bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: isHome ? 52 : 44,
              borderRadius: hasDropdown ? '14px 14px 0 0' : '14px',
              backgroundColor: searchBarBg,
              boxShadow: focusRing,
              px: '4px',
              transition: [
                `border-radius ${DUR_NORMAL}ms ${EASE_SPRING}`,
                `background-color ${DUR_NORMAL}ms ${EASE_SPRING}`,
                `box-shadow ${DUR_NORMAL}ms ${EASE_SPRING}`,
              ].join(', '),
            }}
          >
            <IconButton
              sx={{ p: '8px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', transition: `transform ${DUR_FAST}ms ${EASE_SPRING}`, '&:active': { transform: 'scale(0.88)' } }}
              onClick={() => handleSearch(inputRef.current?.value || '')}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <InputBase
              inputRef={inputRef}
              defaultValue={inputValue}
              sx={{
                flex: 1,
                fontSize: isHome ? '1.05rem' : '0.95rem',
                fontWeight: 400,
                letterSpacing: '-0.005em',
                color: 'text.primary',
                '& input::placeholder': {
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                  opacity: 1,
                },
              }}
              placeholder={t.placeholder}
              onChange={(e) => triggerSuggest(e.target.value)}
              onFocus={() => {
                if (window.innerWidth < 600) { setMobileOpen(true); return; }
                setIsFocused(true);
                triggerSuggest(inputRef.current?.value || '');
                setShowDropdown(true);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(inputRef.current?.value || ''); }}
              readOnly={window.innerWidth < 600}
              onClick={() => window.innerWidth < 600 && setMobileOpen(true)}
            />

            {(!!(window.innerWidth >= 600) && inputValue) && (
              <IconButton
                size="small"
                sx={{ p: '8px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: `transform ${DUR_FAST}ms ${EASE_SPRING}`, '&:active': { transform: 'scale(0.85)' } }}
                onClick={() => { if (inputRef.current) inputRef.current.value = ''; setInputValue(''); triggerSuggest(''); setShowDropdown(false); }}
              >
                <ClearIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            <Divider sx={{ height: 20, mx: 0.5, opacity: 0.4 }} orientation="vertical" />

            <IconButton
              sx={{ p: '8px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', '&:active': { transform: 'scale(0.88)' }, transition: `transform ${DUR_FAST}ms ${EASE_SPRING}` }}
              onClick={() => setAdvancedOpen(true)}
            >
              <TuneIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              sx={{ p: '8px', color: isDark ? '#0a84ff' : '#007aff', transition: `transform ${DUR_FAST}ms ${EASE_SPRING}`, '&:active': { transform: 'scale(0.88)' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MicIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Dropdown */}
          {hasDropdown && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                borderRadius: '0 0 14px 14px',
                overflow: 'hidden',
                zIndex: 9999,
                backgroundColor: isDark ? 'rgba(28,28,30,0.96)' : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              }}
            >
              <List sx={{ py: 1, px: 1 }}>
                {suggestions.map((item, index) => (
                  <SuggestionItem
                    key={`${item.title}-${index}`}
                    title={item.title}
                    isHistory={item.isHistory}
                    onSelect={handleSearch}
                    onRemove={handleRemoveHistory}
                  />
                ))}
              </List>
              {suggestions.some(s => s.isHistory) && (
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => { clearHistory(); triggerSuggest(''); }} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '13px' }}>
                    {t.clearHistory}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </ClickAwayListener>

      <FullScreenSearchDialog open={isMobileSearchOpen} onClose={() => setMobileOpen(false)} onSearch={handleSearch} initialValue={inputRef.current?.value || ''} />
      <AdvancedSearchDialog open={isAdvancedOpen} onClose={() => setAdvancedOpen(false)} onSearch={handleSearch} baseQuery={inputValue} />
    </Box>
  );
};

export default memo(SearchBox);
