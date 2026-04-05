import React from 'react';
import { List, Divider, Paper, MenuItem, IconButton, Tooltip } from '@mui/material';
import {
  DarkModeOutlined   as DarkModeIcon,
  AnimationOutlined  as AnimationIcon,
  LanguageOutlined   as LanguageIcon,
  SettingsOutlined   as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/haptics';
import SectionHeader from './SectionHeader';
import SelectItem from './SelectItem';
import SwitchItem from './SwitchItem';

interface Props {
  t: any;
  themeMode: string;
  setThemeMode: (v: any) => void;
  enableAnimations: boolean;
  setEnableAnimations: (v: boolean) => void;
  language: string;
  setLanguage: (v: any) => void;
}

const SettingsDisplaySection: React.FC<Props> = ({
  t, themeMode, setThemeMode, enableAnimations, setEnableAnimations, language, setLanguage,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <SectionHeader label={t.sectionDisplay} />
      <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <List sx={{ py: 0 }}>
          <SelectItem
            icon={<DarkModeIcon />}
            primary={t.appearance}
            secondary={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
            value={themeMode}
            onChange={setThemeMode}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </SelectItem>
          <Divider />
          <SwitchItem icon={<AnimationIcon />} primary={t.enableAnimations} checked={enableAnimations} onChange={setEnableAnimations} />
        </List>
      </Paper>

      {/* 言語 + 設定ボタンを横並び */}
      <SectionHeader
        label={t.language}
        action={
          <Tooltip title={t.settings}>
            <IconButton
              size="small"
              onClick={() => { triggerHaptic(); navigate('/settings'); }}
              sx={{
                borderRadius: '10px',
                color: 'text.secondary',
                '&:active': { transform: 'scale(0.88)' },
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <List sx={{ py: 0 }}>
          <SelectItem
            icon={<LanguageIcon />}
            primary={t.language}
            secondary={language === 'ja' ? '日本語' : 'English'}
            value={language}
            onChange={setLanguage}
          >
            <MenuItem value="ja">日本語</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </SelectItem>
        </List>
      </Paper>
    </>
  );
};

export default SettingsDisplaySection;
