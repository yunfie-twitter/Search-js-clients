import React from 'react';
import { List, Divider, Paper, MenuItem } from '@mui/material';
import {
  PublicOutlined as PublicIcon,
  TranslateOutlined as TranslateIcon,
} from '@mui/icons-material';
import SectionHeader from './SectionHeader';
import SelectItem from './SelectItem';

interface Props {
  t: any;
  searchRegion: string;
  setSearchRegion: (v: any) => void;
  searchLang: string;
  setSearchLang: (v: any) => void;
}

const SettingsRegionSection: React.FC<Props> = ({
  t, searchRegion, setSearchRegion, searchLang, setSearchLang,
}) => (
  <>
    <SectionHeader label={t.sectionRegion} />
    <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <List sx={{ py: 0 }}>
        <SelectItem icon={<PublicIcon />} primary={t.searchRegion} value={searchRegion} onChange={setSearchRegion}>
          <MenuItem value="JP">Japan (JP)</MenuItem>
          <MenuItem value="US">United States (US)</MenuItem>
          <MenuItem value="GB">United Kingdom (GB)</MenuItem>
          <MenuItem value="KR">Korea (KR)</MenuItem>
          <MenuItem value="CN">China (CN)</MenuItem>
          <MenuItem value="DE">Germany (DE)</MenuItem>
          <MenuItem value="FR">France (FR)</MenuItem>
        </SelectItem>
        <Divider />
        <SelectItem icon={<TranslateIcon />} primary={t.searchLang} value={searchLang} onChange={setSearchLang}>
          <MenuItem value="ja">日本語 (ja)</MenuItem>
          <MenuItem value="en">English (en)</MenuItem>
          <MenuItem value="ko">한국어 (ko)</MenuItem>
          <MenuItem value="zh-CN">中文 (zh-CN)</MenuItem>
          <MenuItem value="de">Deutsch (de)</MenuItem>
          <MenuItem value="fr">Français (fr)</MenuItem>
        </SelectItem>
      </List>
    </Paper>
  </>
);

export default SettingsRegionSection;
