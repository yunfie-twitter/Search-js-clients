import React, { memo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, List, ListItem, 
  ListItemText, ListItemIcon, IconButton, Typography, 
  Box, Badge, Divider, Button 
} from '@mui/material';
import { 
  NotificationsOutlined as NotificationsIcon,
  UpdateOutlined as UpdateIcon,
  RssFeedOutlined as RssIcon,
  CloseOutlined as CloseIcon,
  DeleteSweepOutlined as ClearIcon
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerHaptic } from '../utils/haptics';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationDialog: React.FC<Props> = ({ open, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications, language } = useSearchStore(useShallow(s => ({
    notifications: s.notifications,
    markNotificationRead: s.markNotificationRead,
    clearNotifications: s.clearNotifications,
    language: s.language
  })));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: '20px', maxHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6" fontWeight={700}>
            {language === 'ja' ? '通知' : 'Notifications'}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={clearNotifications}>
            <ClearIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
            <Typography variant="body2">
              {language === 'ja' ? '新しい通知はありません' : 'No notifications'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((n) => (
              <React.Fragment key={n.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: n.read ? 'transparent' : 'action.hover',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    markNotificationRead(n.id);
                    triggerHaptic();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {n.type === 'update' ? <UpdateIcon color="primary" /> : <RssIcon color="success" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={n.title}
                    secondary={
                      <>
                        <Typography variant="caption" color="text.disabled" display="block" gutterBottom>
                          {new Date(n.date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {n.message}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(NotificationDialog);
