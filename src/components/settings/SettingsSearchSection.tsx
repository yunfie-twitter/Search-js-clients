import React from 'react';
import { List, Divider, Paper, MenuItem } from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  FilterListOutlined as FilterIcon,
  TimerOutlined as TimerIcon,
  FormatListNumberedOutlined as ListIcon,
} from '@mui/icons-material';
import SectionHeader from './SectionHeader';
import SelectItem from './SelectItem';

interface Props {
  t: any;
  resultsPerPage: number;
  setResultsPerPage: (v: any) => void;
  defaultSearchType: string;
  setDefaultSearchType: (v: any) => void;
  safeSearch: string;
  setSafeSearch: (v: any) => void;
  cacheTtl: number;
  setCacheTtl: (v: any) => void;
}

const SettingsSearchSection: React.FC<Props> = ({
  t, resultsPerPage, setResultsPerPage,
  defaultSearchType, setDefaultSearchType,
  safeSearch, setSafeSearch,
  cacheTtl, setCacheTtl,
}) => (
  <>
    <SectionHeader label={t.sectionSearch} />
    <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <List sx={{ py: 0 }}>
        <SelectItem icon={<ListIcon />} primary={t.resultsPerPage} value={String(resultsPerPage)} onChange={(v) => setResultsPerPage(Number(v) as any)}>
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="20">20</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </SelectItem>
        <Divider />
        <SelectItem icon={<SearchIcon />} primary={t.defaultSearchType} value={defaultSearchType} onChange={setDefaultSearchType}>
          <MenuItem value="web">{t.all}</MenuItem>
          <MenuItem value="image">{t.images}</MenuItem>
          <MenuItem value="video">{t.videos}</MenuItem>
          <MenuItem value="news">{t.news}</MenuItem>
        </SelectItem>
        <Divider />
        <SelectItem icon={<FilterIcon />} primary={t.safeSearch} value={safeSearch} onChange={setSafeSearch}>
          <MenuItem value="off">{t.safeSearchOff}</MenuItem>
          <MenuItem value="moderate">{t.safeSearchModerate}</MenuItem>
          <MenuItem value="strict">{t.safeSearchStrict}</MenuItem>
        </SelectItem>
        <Divider />
        <SelectItem icon={<TimerIcon />} primary={t.cacheTtl} value={String(cacheTtl)} onChange={(v) => setCacheTtl(Number(v) as any)}>
          <MenuItem value="0">{t.cacheTtlNone}</MenuItem>
          <MenuItem value="5">{t.cacheTtl5}</MenuItem>
          <MenuItem value="30">{t.cacheTtl30}</MenuItem>
          <MenuItem value="60">{t.cacheTtl60}</MenuItem>
        </SelectItem>
      </List>
    </Paper>
  </>
);

export default SettingsSearchSection;
