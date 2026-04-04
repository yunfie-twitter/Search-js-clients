import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { 
  Dialog, 
  Box, 
  InputBase, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Slide 
} from '@mui/material';
import { 
  ArrowBackOutlined as ArrowBackIcon, 
  MicOutlined as MicIcon, 
  HistoryOutlined as HistoryIcon, 
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { getHistory, removeHistory } from '@yunfie/search-js';
import { API_BASE } from '../config';
import translations from '../translations';
import { useSearchStore } from '../store/useSearchStore';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return (
    <Slide 
      direction="up" 
      ref={ref} 
      {...props} 
      timeout={350}
      easing={{
        enter: 'cubic-bezier(0.22, 1, 0.36, 1)',
        exit: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    />
  );
});


const FullScreenSuggestionItem = memo(({ item, onSelect, onRemove }: any) => (
  <ListItem 
    disablePadding
    secondaryAction={
      item.isHistory && (
        <IconButton edge="end" onClick={(e) => onRemove(e, item.title)} sx={{ p: 1.5, color: 'text.secondary' }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )
    }
  >
    <ListItemButton onClick={() => onSelect(item.title)} sx={{ py: 1.5 }}>
      <ListItemIcon sx={{ minWidth: 48 }}>
        {item.isHistory ? <HistoryIcon color="action" /> : <SearchIcon color="action" />}
      </ListItemIcon>
      <ListItemText 
        primary={item.title} 
        primaryTypographyProps={{ fontSize: '1rem' }} 
      />
    </ListItemButton>
  </ListItem>
));

const FullScreenSearchDialog: React.FC<any> = ({ open, onClose, onSearch, initialValue }) => {
  const [suggestions, setSuggestions] = useState<{ title: string; isHistory: boolean }[]>([]);
  const { language } = useSearchStore();
  const t = translations[language];
  const [inputValue, setInputValue] = useState(initialValue);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const latestQueryRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSuggestions = useCallback(async (val: string) => {
    setInputValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    latestQueryRef.current = val;

    if (!val.trim()) {
      const history = getHistory();
      setSuggestions(history.map(h => ({ title: h.q, isHistory: true })).slice(0, 15));
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        // ライブラリのバグを回避するため直接APIを叩く
        const url = `${API_BASE}/search?q=${encodeURIComponent(val)}&type=suggest`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        
        if (response.ok && val === latestQueryRef.current) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (data.results || data.items || []);
          
          const formatted = items.slice(0, 15).map((it: any) => ({
            title: typeof it === 'string' ? it : (it.title || it.text || ''),
            isHistory: false
          }));
          
          setSuggestions(formatted);
        }
      } catch (err) {
        console.error('Mobile safe suggest fail:', err);
      }
    }, 150);
  }, []);

  useEffect(() => {
    if (open) {
      const tid = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = initialValue;
          setInputValue(initialValue);
          updateSuggestions(initialValue);
        }
      }, 50);
      return () => clearTimeout(tid);
    }
  }, [open, initialValue, updateSuggestions]);

  const handleRemoveHistory = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeHistory(q);
    updateSuggestions(inputRef.current?.value || '');
  }, [updateSuggestions]);

  return (
    <Dialog 
      fullScreen 
      open={open} 
      onClose={onClose} 
      TransitionComponent={Transition}
      disableRestoreFocus
      PaperProps={{
        sx: { backgroundColor: 'background.default' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <IconButton onClick={onClose} sx={{ p: 1.5, color: 'text.secondary' }}><ArrowBackIcon /></IconButton>
        <InputBase
          autoFocus
          inputRef={inputRef}
          fullWidth
          placeholder={t.placeholder}
          onChange={(e) => updateSuggestions(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(inputRef.current?.value || '')}
          sx={{ 
            ml: 1, 
            fontSize: '1.1rem', 
            flex: 1, 
            color: 'text.primary',
            '& input::placeholder': {
              color: 'text.secondary',
              opacity: 0.7
            }
          }}
        />
        {inputValue && (
          <IconButton 
            onClick={() => { if (inputRef.current) inputRef.current.value = ''; updateSuggestions(''); }}
            sx={{ p: 1, color: 'text.secondary' }}
          >
            <ClearIcon />
          </IconButton>
        )}
        <IconButton sx={{ p: 1, color: '#4285f4' }}><MicIcon /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', backgroundColor: 'background.default' }}>
        <List>
          {suggestions.map((item, index) => (
            <FullScreenSuggestionItem 
              key={`${item.title}-${index}`} 
              item={item} 
              onSelect={onSearch} 
              onRemove={handleRemoveHistory} 
            />
          ))}
        </List>
      </Box>
    </Dialog>
  );
};

export default memo(FullScreenSearchDialog);
