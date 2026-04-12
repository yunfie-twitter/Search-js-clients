import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Paper, IconButton, TextField, Button, Divider, Stack, Chip, Avatar
} from '@mui/material';
import { 
  DevicesOutlined as DevicesIcon,
  SmartphoneOutlined as MobileIcon,
  LaptopOutlined as PcIcon,
  SyncOutlined as SyncIcon,
  CheckCircleOutlined as OnlineIcon,
  EditOutlined as EditIcon,
  CheckOutlined as SaveIcon
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { triggerHaptic } from '../utils/haptics';

const Devices: React.FC = () => {
  const { deviceId, deviceName, setDeviceName, connectedDevices, enableSync } = useSearchStore(useShallow(s => ({
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    setDeviceName: s.setDeviceName,
    connectedDevices: s.connectedDevices,
    enableSync: s.enableSync
  })));

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(deviceName || '');

  const handleSaveName = () => {
    setDeviceName(tempName);
    setIsEditing(false);
    triggerHaptic();
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('iphone') || n.includes('android')) return <MobileIcon />;
    return <PcIcon />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: 'background.default' }}>
      <PageHeader title="接続デバイス" />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <PageTransition>
          <Container maxWidth="sm" sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* このデバイスの設定 */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <DevicesIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>このデバイス</Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        autoFocus
                        onBlur={handleSaveName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        InputProps={{
                          endAdornment: <IconButton size="small" onClick={handleSaveName}><SaveIcon fontSize="small" /></IconButton>,
                          sx: { borderRadius: '10px' }
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={800}>{deviceName || '未設定'}</Typography>
                        <IconButton size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="inherit" /></IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">ID: {deviceId}</Typography>
              </Stack>
            </Paper>

            {/* 他のデバイス一覧 */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ ml: 2, fontWeight: 700 }}>グループ内の他端末 ({connectedDevices.length})</Typography>
              {!enableSync ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px', mt: 1 }}>
                  <SyncIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">同期が有効になっていません</Typography>
                </Paper>
              ) : connectedDevices.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">他のデバイスは見つかりませんでした</Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mt: 1 }}>
                  <List sx={{ py: 0 }}>
                    {connectedDevices.map((device, idx) => (
                      <React.Fragment key={device.id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemIcon sx={{ minWidth: 48 }}>
                            {getIcon(device.name)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={device.name} 
                            primaryTypographyProps={{ fontWeight: 700 }}
                            secondary={`最終確認: ${new Date(device.lastSeen).toLocaleTimeString()}`}
                          />
                          <Chip 
                            icon={<OnlineIcon sx={{ fontSize: '14px !important' }} />} 
                            label="Online" 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '10px' }} 
                          />
                        </ListItem>
                        {idx < connectedDevices.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ px: 2 }}>
              同じグループIDを設定している端末がここに表示されます。<br/>
              設定の変更や検索履歴はリアルタイムでこれらの端末と共有されます。
            </Typography>

          </Container>
        </PageTransition>
      </Box>
    </Box>
  );
};

export default Devices;
