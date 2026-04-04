import React from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
} from '@mui/material';
import { triggerHaptic } from '../../utils/haptics';

interface Props {
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  value: string;
  onChange: (v: any) => void;
  children: React.ReactNode;
}

const SelectItem: React.FC<Props> = ({ icon, primary, secondary, value, onChange, children }) => (
  <ListItem sx={{ py: 1.5 }}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={primary} secondary={secondary} />
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <Select
        value={value}
        onChange={(e) => { triggerHaptic(); onChange(e.target.value); }}
        sx={{ borderRadius: '8px' }}
      >
        {children}
      </Select>
    </FormControl>
  </ListItem>
);

export default SelectItem;
