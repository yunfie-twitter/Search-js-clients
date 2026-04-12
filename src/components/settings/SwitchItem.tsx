import React from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Box,
  Chip,
} from '@mui/material';
import { triggerHaptic } from '../../utils/haptics';

interface Props {
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  chip?: string;
}

const SwitchItem: React.FC<Props> = ({ icon, primary, secondary, checked, onChange, disabled, chip }) => (
  <ListItem sx={{ py: 1.5, opacity: disabled ? 0.5 : 1 }}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText
      primaryTypographyProps={{ component: 'div' }}
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {primary}
          {chip && (
            <Chip
              label={chip}
              size="small"
              color="warning"
              sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
            />
          )}
        </Box>
      }
      secondary={secondary}
    />
    <Switch
      checked={checked}
      onChange={(e) => { triggerHaptic(); onChange(e.target.checked); }}
      disabled={disabled}
    />
  </ListItem>
);

export default SwitchItem;

