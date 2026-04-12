import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Paper, IconButton, TextField, Divider, Stack, Chip, Avatar, Button, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { 
  DevicesOutlined as DevicesIcon,
  SmartphoneOutlined as MobileIcon,
  LaptopOutlined as PcIcon,
  SyncOutlined as SyncIcon,
  CheckCircleOutlined as OnlineIcon,
  ErrorOutline as OfflineIcon,
  EditOutlined as EditIcon,
  CheckOutlined as SaveIcon,
  CloudSyncOutlined as ManualSyncIcon,
  AdminPanelSettingsOutlined as OwnerIcon,
  PersonOutline as GuestIcon
} from '@mui/icons-material';
import { useSearchStore, DeviceRole } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { triggerHaptic } from '../utils/haptics';

const OFFLINE_MS = 60000;

const Devices: React.FC = () => {
  const { deviceId, deviceName, setDeviceName, deviceRole, setDeviceRole, connectedDevices, enableSync, triggerFullSync } = useSearchStore(useShallow(s => ({
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    setDeviceName: s.setDeviceName,
    deviceRole: s.deviceRole,
    setDeviceRole: s.setDeviceRole,
    connectedDevices: s.connectedDevices,
    enableSync: s.enableSync,
    triggerFullSync: s.triggerFullSync
  })));

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(deviceName || '');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveName = () => {
    setDeviceName(tempName);
    setIsEditing(false);
    triggerHaptic();
  };

  const getIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('iphone') || n.includes('android')) return <MobileIcon />;
    return <PcIcon />;
  };

  const sortedDevices = [...connectedDevices].sort((a, b) => b.lastSeen - a.lastSeen);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: 'background.default' }}>
      <PageHeader title="接続デバイス" />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <PageTransition>
          <Container maxWidth="sm" sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: enableSync ? 'rgba(76, 175, 80, 0.05)' : 'transparent' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SyncIcon color={enableSync ? "success" : "disabled"} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {enableSync ? "同期システム稼働中" : "同期は無効です"}
                  </Typography>
                </Box>
                {enableSync && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<ManualSyncIcon />} 
                    onClick={() => { triggerFullSync(); triggerHaptic(); }}
                    sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: 'none' }}
                  >
                    強制同期
                  </Button>
                )}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <DevicesIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>このデバイスの名前</Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth size="small" value={tempName} onChange={(e) => setTempName(e.target.value)}
                        autoFocus onBlur={handleSaveName} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        InputProps={{ endAdornment: <IconButton size="small" onClick={handleSaveName}><SaveIcon fontSize="small" /></IconButton>, sx: { borderRadius: '10px' } }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={800}>{deviceName || '未設定'}</Typography>
                        <IconButton size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="inherit" /></IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', fontWeight: 700 }}>同期権限設定</Typography>
                  <ToggleButtonGroup
                    fullWidth
                    value={deviceRole}
                    exclusive
                    onChange={(_, v) => v && setDeviceRole(v as DeviceRole)}
                    size="small"
                    sx={{ bgcolor: 'action.hover', borderRadius: '12px', p: 0.5 }}
                  >
                    <ToggleButton value="owner" sx={{ border: 'none', borderRadius: '10px !important', textTransform: 'none', gap: 1 }}>
                      <OwnerIcon fontSize="small" /> オーナー
                    </ToggleButton>
                    <ToggleButton value="guest" sx={{ border: 'none', borderRadius: '10px !important', textTransform: 'none', gap: 1 }}>
                      <GuestIcon fontSize="small" /> ゲスト
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', px: 1, lineHeight: 1.4 }}>
                    {deviceRole === 'owner' 
                      ? '● 他端末と設定・履歴の両方を共有します。' 
                      : '● 履歴のみを他端末に共有します。他端末からの設定変更は受け取りません。'}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>Device ID: {deviceId}</Typography>
              </Stack>
            </Paper>

            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ ml: 2, fontWeight: 700 }}>グループ内のデバイス ({sortedDevices.length})</Typography>
              {sortedDevices.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px', mt: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                  <Typography variant="body2" color="text.secondary">ペアリング済みの他端末はありません</Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mt: 1 }}>
                  <List sx={{ py: 0 }}>
                    {sortedDevices.map((device, idx) => {
                      const isOnline = (now - device.lastSeen) < OFFLINE_MS;
                      return (
                        <React.Fragment key={device.id}>
                          <ListItem sx={{ py: 2 }}>
                            <ListItemIcon sx={{ minWidth: 48 }}>
                              {getIcon(device.name)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {device.name}
                                  {device.role === 'owner' ? <OwnerIcon sx={{ fontSize: 14, color: 'primary.main' }} /> : <GuestIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                                </Box>
                              }
                              primaryTypographyProps={{ fontWeight: 700, color: isOnline ? 'text.primary' : 'text.secondary' }}
                              secondary={isOnline ? 'オンライン' : `最終確認: ${new Date(device.lastSeen).toLocaleTimeString()}`}
                            />
                            <Chip 
                              icon={isOnline ? <OnlineIcon sx={{ fontSize: '14px !important' }} /> : <OfflineIcon sx={{ fontSize: '14px !important' }} />} 
                              label={isOnline ? "Online" : "Offline"} 
                              size="small" 
                              color={isOnline ? "success" : "default"} 
                              variant={isOnline ? "outlined" : "filled"} 
                              sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '10px', opacity: isOnline ? 1 : 0.6 }} 
                            />
                          </ListItem>
                          {idx < sortedDevices.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Paper>
              )}
            </Box>
          </Container>
        </PageTransition>
      </Box>
    </Box>
  );
};

export default Devices;
