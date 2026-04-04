import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Switch, 
  IconButton, 
  Divider, 
  Paper,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { 
  ArrowBackOutlined as ArrowBackIcon, 
  DarkModeOutlined as DarkModeIcon, 
  LanguageOutlined as LanguageIcon,
  HistoryOutlined as HistoryIcon,
  AnimationOutlined as AnimationIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { 
    themeMode, setThemeMode, 
    language, setLanguage,
    saveHistory, setSaveHistory,
    enableAnimations, setEnableAnimations
  } = useSearchStore();
  const t = translations[language];

  const handleBack = () => {
    triggerHaptic();
    navigate(-1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t.settings}
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4, flexGrow: 1 }}>
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            {/* Appearance */}
            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><DarkModeIcon /></ListItemIcon>
              <ListItemText primary={t.appearance} secondary={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={themeMode}
                  onChange={(e) => { triggerHaptic(); setThemeMode(e.target.value as any); }}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider />

            {/* Language */}
            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><LanguageIcon /></ListItemIcon>
              <ListItemText primary={t.language} secondary={language === 'ja' ? '日本語' : 'English'} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={language}
                  onChange={(e) => { triggerHaptic(); setLanguage(e.target.value as any); }}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider />

            {/* Save History */}
            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? '検索履歴を保存する' : 'Save Search History'} />
              <Switch 
                checked={saveHistory} 
                onChange={(e) => { triggerHaptic(); setSaveHistory(e.target.checked); }} 
              />
            </ListItem>
            <Divider />

            {/* Animations */}
            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><AnimationIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? 'アニメーションを有効にする' : 'Enable Animations'} />
              <Switch 
                checked={enableAnimations} 
                onChange={(e) => { triggerHaptic(); setEnableAnimations(e.target.checked); }} 
              />
            </ListItem>
            <Divider />

            {/* Version */}
            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="Version" secondary="1.1.0 (Native Update)" />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings;
