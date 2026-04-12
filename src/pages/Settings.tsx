import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Box, Container, List, Paper, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Snackbar, Chip, useMediaQuery, useTheme, Typography, Divider, Stack, 
  TextField, InputAdornment,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  HistoryOutlined as HistoryIcon,
  InfoOutlined as InfoIcon,
  ChevronRightOutlined as ChevronRightIcon,
  WarningAmberOutlined as WarningIcon,
  PaletteOutlined as DisplayIcon,
  SearchOutlined as SearchSettingsIcon,
  PublicOutlined as RegionIcon,
  ScienceOutlined as LabsIcon,
  SettingsOutlined as GeneralIcon,
  LockOutlined as PrivacyIcon,
  StorageOutlined as DataIcon,
  QrCodeOutlined as QrCodeIcon,
  QrCodeScannerOutlined as ScanIcon,
  DeleteForeverOutlined as DeleteIcon,
  CloudUploadOutlined as ImportFileIcon,
  CloudDownloadOutlined as ExportFileIcon,
  SyncOutlined as SyncIcon,
  GroupOutlined as GroupIcon,
  DnsOutlined as ServerIcon,
  DevicesOutlined as DevicesIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import translations from '../translations';
import { triggerHaptic } from '../utils/haptics';
import SectionHeader from '../components/settings/SectionHeader';
import SwitchItem from '../components/settings/SwitchItem';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';
import { BottomNavSpacer } from '../components/MobileBottomNav';
import SettingsDisplaySection from '../components/settings/SettingsDisplaySection';
import SettingsSearchSection from '../components/settings/SettingsSearchSection';
import SettingsRegionSection from '../components/settings/SettingsRegionSection';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

const TAP_REQUIRED = 5;
const TAP_RESET_MS = 2000;

type SectionId = 'display' | 'search' | 'region' | 'privacy' | 'sync' | 'data' | 'about';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    themeMode, setThemeMode,
    language, setLanguage,
    saveHistory, setSaveHistory,
    enableAnimations, setEnableAnimations,
    pageTransitionType, setPageTransitionType,
    resultsPerPage, setResultsPerPage,
    defaultSearchType, setDefaultSearchType,
    safeSearch, setSafeSearch,
    cacheTtl, setCacheTtl,
    searchRegion, setSearchRegion,
    searchLang, setSearchLang,
    expUnlocked, setExpUnlocked,
    expLowEndMode, setExpLowEndMode,
    expProgressiveRender, setExpProgressiveRender,
    searchServerMode, setSearchServerMode,
    customSearchServer, setCustomSearchServer,
    resetAllData, exportData, importData,
    syncGroupId, setSyncGroupId, 
    syncServerMode, setSyncServerMode,
    syncServerUrl, setSyncServerUrl,
    enableSync, setEnableSync,
  } = useSearchStore(useShallow(s => ({ 
    themeMode: s.themeMode, setThemeMode: s.setThemeMode, 
    language: s.language, setLanguage: s.setLanguage, 
    saveHistory: s.saveHistory, setSaveHistory: s.setSaveHistory, 
    enableAnimations: s.enableAnimations, setEnableAnimations: s.setEnableAnimations, 
    pageTransitionType: s.pageTransitionType, setPageTransitionType: s.setPageTransitionType, 
    resultsPerPage: s.resultsPerPage, setResultsPerPage: s.setResultsPerPage, 
    defaultSearchType: s.defaultSearchType, setDefaultSearchType: s.setDefaultSearchType, 
    safeSearch: s.safeSearch, setSafeSearch: s.setSafeSearch, 
    cacheTtl: s.cacheTtl, setCacheTtl: s.setCacheTtl, 
    searchRegion: s.searchRegion, setSearchRegion: s.setSearchRegion, 
    searchLang: s.searchLang, setSearchLang: s.setSearchLang, 
    expUnlocked: s.expUnlocked, setExpUnlocked: s.setExpUnlocked, 
    expLowEndMode: s.expLowEndMode, setExpLowEndMode: s.setExpLowEndMode, 
    expProgressiveRender: s.expProgressiveRender, setExpProgressiveRender: s.setExpProgressiveRender,
    searchServerMode: s.searchServerMode, setSearchServerMode: s.setSearchServerMode,
    customSearchServer: s.customSearchServer, setCustomSearchServer: s.setCustomSearchServer,
    resetAllData: s.resetAllData, exportData: s.exportData, importData: s.importData,
    syncGroupId: s.syncGroupId, setSyncGroupId: s.setSyncGroupId,
    syncServerMode: s.syncServerMode, setSyncServerMode: s.setSyncServerMode,
    syncServerUrl: s.syncServerUrl, setSyncServerUrl: s.setSyncServerUrl,
    enableSync: s.enableSync, setEnableSync: s.setEnableSync,
  })));
  
  const t = translations[language];

  const [activeSection, setActiveSection] = useState<SectionId>('display');
  const [, setTapCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQrExport, setShowQrExport] = useState(false);
  const [showSyncQr, setShowSyncQr] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'import' | 'sync'>('import');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleVersionTap = useCallback(() => {
    if (expUnlocked) { triggerHaptic(); navigate('/labs'); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTapCount(0), TAP_RESET_MS);
    setTapCount((prev) => {
      const next = prev + 1;
      const remaining = TAP_REQUIRED - next;
      if (next >= TAP_REQUIRED) { setShowWarning(true); triggerHaptic(); return 0; }
      if (next >= 2) {
        setSnackMsg(language === 'ja'
          ? `あと ${remaining} 回で実験的機能が解除されます`
          : `${remaining} more tap${remaining !== 1 ? 's' : ''} to unlock experimental features`);
      }
      return next;
    });
  }, [expUnlocked, language, navigate]);

  const handleWarningOk = useCallback(() => {
    setShowWarning(false);
    setExpUnlocked(true);
    triggerHaptic();
    navigate('/labs');
  }, [navigate, setExpUnlocked]);

  const handleExportFile = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wholphin_settings_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHaptic();
    setSnackMsg(language === 'ja' ? '設定をエクスポートしました' : 'Settings exported');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (importData(json)) {
        triggerHaptic();
        setSnackMsg(language === 'ja' ? '設定をインポートしました' : 'Settings imported');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSnackMsg(language === 'ja' ? '不正なファイルです' : 'Invalid file');
      }
    };
    reader.readAsText(file);
  };

  const handleExportQr = async () => {
    const data = exportData();
    try {
      const url = await QRCode.toDataURL(data, { width: 400, margin: 2 });
      setQrImageUrl(url);
      setShowQrExport(true);
      triggerHaptic();
    } catch (err) {
      setSnackMsg(language === 'ja' ? 'QRコードの生成に失敗しました' : 'Failed to generate QR');
    }
  };

  const handleShowSyncQr = async () => {
    if (!syncGroupId) setSyncGroupId(''); // Generate if empty
    const syncData = JSON.stringify({ id: syncGroupId || useSearchStore.getState().syncGroupId, srv: syncServerUrl });
    try {
      const url = await QRCode.toDataURL(syncData, { width: 400, margin: 2 });
      setQrImageUrl(url);
      setShowSyncQr(true);
      triggerHaptic();
    } catch (err) {
      setSnackMsg(language === 'ja' ? 'QRコードの生成に失敗しました' : 'Failed to generate QR');
    }
  };

  const handleStartScan = async (mode: 'import' | 'sync') => {
    setScannerMode(mode);
    setShowQrScanner(true);
    triggerHaptic();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      setShowQrScanner(false);
      setSnackMsg(language === 'ja' ? 'カメラへのアクセスが拒否されました' : 'Camera access denied');
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !showQrScanner) return;
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      // パフォーマンスのため解像度を少し落として処理
      const scale = 0.5;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code) {
          if (handleScannedResult(code.data)) {
            return; // 成功時のみループ終了
          }
        }
      }
    }
    requestAnimationFrame(scanFrame);
  };

  const handleScannedResult = (data: string): boolean => {
    if (scannerMode === 'import') {
      if (importData(data)) {
        triggerHaptic();
        stopScan();
        setSnackMsg(language === 'ja' ? '設定をインポートしました' : 'Settings imported');
        setTimeout(() => window.location.reload(), 800);
        return true;
      }
    } else {
      try {
        const syncObj = JSON.parse(data);
        if (syncObj.id && syncObj.srv) {
          setSyncGroupId(syncObj.id);
          setSyncServerUrl(syncObj.srv);
          setEnableSync(true);
          triggerHaptic();
          stopScan();
          setSnackMsg(language === 'ja' ? '同期設定を完了しました' : 'Sync pairing completed');
          return true;
        }
      } catch (e) { /* Invalid Sync QR, keep scanning */ }
    }
    return false;
  };

  const stopScan = () => {
    setShowQrScanner(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleDeleteAll = () => {
    resetAllData();
    triggerHaptic();
    setShowDeleteConfirm(false);
    setSnackMsg(language === 'ja' ? 'すべてのデータを削除しました' : 'All data deleted');
    setTimeout(() => window.location.reload(), 1000);
  };

  const sidebarItems = useMemo(() => [
    { id: 'display', label: language === 'ja' ? '表示設定' : 'Display', Icon: DisplayIcon },
    { id: 'search',  label: language === 'ja' ? '検索設定' : 'Search',  Icon: SearchSettingsIcon },
    { id: 'region',  label: language === 'ja' ? '地域と言語' : 'Region', Icon: RegionIcon },
    { id: 'privacy', label: language === 'ja' ? 'プライバシー' : 'Privacy', Icon: PrivacyIcon },
    { id: 'sync',    label: language === 'ja' ? 'リアルタイム同期' : 'Sync', Icon: SyncIcon },
    { id: 'data',    label: language === 'ja' ? 'データ管理' : 'Data Management', Icon: DataIcon },
    { id: 'about',   label: language === 'ja' ? 'このアプリについて' : 'About', Icon: InfoIcon },
  ], [language]);

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    if (isMobile) {
      const el = document.getElementById(`section-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderContent = () => (
    <>
      <div id="section-display">
        <SettingsDisplaySection
          t={t} themeMode={themeMode} setThemeMode={setThemeMode}
          enableAnimations={enableAnimations} setEnableAnimations={setEnableAnimations}
          pageTransitionType={pageTransitionType} setPageTransitionType={setPageTransitionType}
          expLowEndMode={expLowEndMode} setExpLowEndMode={setExpLowEndMode}
          expProgressiveRender={expProgressiveRender} setExpProgressiveRender={setExpProgressiveRender}
          language={language} setLanguage={setLanguage}
        />
      </div>
      <div id="section-search">
        <SettingsSearchSection
          t={t} resultsPerPage={resultsPerPage} setResultsPerPage={setResultsPerPage}
          defaultSearchType={defaultSearchType} setDefaultSearchType={setDefaultSearchType}
          safeSearch={safeSearch} setSafeSearch={setSafeSearch}
          cacheTtl={cacheTtl} setCacheTtl={setCacheTtl}
          searchServerMode={searchServerMode} setSearchServerMode={setSearchServerMode}
          customSearchServer={customSearchServer} setCustomSearchServer={setCustomSearchServer}
        />
      </div>
      <div id="section-region">
        <SettingsRegionSection
          t={t} searchRegion={searchRegion} setSearchRegion={setSearchRegion}
          searchLang={searchLang} setSearchLang={setSearchLang}
        />
      </div>
      <div id="section-privacy">
        <SectionHeader label={t.sectionPrivacy} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <SwitchItem icon={<HistoryIcon />} primary={t.saveHistory} checked={saveHistory} onChange={setSaveHistory} />
          </List>
        </Paper>
      </div>
      
      <div id="section-sync">
        <SectionHeader label={language === 'ja' ? 'リアルタイム同期' : 'Sync'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
               {language === 'ja' ? 'QRコードを使用して他の端末とペアリングし、設定を同期します。' : 'Pair with other devices using QR code to sync settings.'}
             </Typography>
             <Stack direction="row" spacing={2} justifyContent="center">
               <Button variant="contained" startIcon={<QrCodeIcon />} onClick={handleShowSyncQr} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                 {language === 'ja' ? '同期QRを表示' : 'Show Sync QR'}
               </Button>
               <Button variant="outlined" startIcon={<ScanIcon />} onClick={() => handleStartScan('sync')} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                 {language === 'ja' ? 'スキャン' : 'Pair Scan'}
               </Button>
             </Stack>
          </Box>
          <Divider />
          <List sx={{ py: 0 }}>
            <SwitchItem 
              icon={<SyncIcon />} 
              primary={language === 'ja' ? '同期を有効にする' : 'Enable Sync'} 
              checked={enableSync} 
              onChange={setEnableSync} 
            />
            <Divider />
            <ListItem button onClick={() => navigate('/device')}>
              <ListItemIcon><DevicesIcon /></ListItemIcon>
              <ListItemText 
                primary={language === 'ja' ? '接続デバイス一覧' : 'Connected Devices'} 
                secondary={
                  enableSync 
                    ? (language === 'ja' ? `${useSearchStore.getState().connectedDevices.length} 台の端末がオンライン` : `${useSearchStore.getState().connectedDevices.length} devices online`)
                    : (language === 'ja' ? '同期が無効です' : 'Sync disabled')
                } 
              />
              <ChevronRightIcon />
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>Advanced Settings</Typography>
            <Stack spacing={2}>
              <TextField
                label={language === 'ja' ? 'グループID' : 'Group ID'}
                value={syncGroupId}
                onChange={(e) => setSyncGroupId(e.target.value.toUpperCase())}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><GroupIcon fontSize="small" /></InputAdornment>,
                  sx: { borderRadius: '10px' }
                }}
              />
              
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, mb: 0.5, display: 'block', fontWeight: 700 }}>シグナリングサーバー</Typography>
                <ToggleButtonGroup 
                  fullWidth 
                  value={syncServerMode} 
                  exclusive 
                  onChange={(_, v) => {
                    if (v) {
                      setSyncServerMode(v);
                      if (v === 'default') setSyncServerUrl('wss://turn.wholphin.net/ws');
                    }
                  }} 
                  size="small" 
                  sx={{ bgcolor: 'action.hover', borderRadius: '10px', p: 0.5, mb: syncServerMode === 'custom' ? 1 : 0 }}
                >
                  <ToggleButton value="default" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Default</ToggleButton>
                  <ToggleButton value="custom" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Custom</ToggleButton>
                </ToggleButtonGroup>
                
                {syncServerMode === 'custom' && (
                  <TextField
                    placeholder="wss://your-server.com/ws"
                    value={syncServerUrl}
                    onChange={(e) => setSyncServerUrl(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><ServerIcon fontSize="small" /></InputAdornment>,
                      sx: { borderRadius: '10px' }
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Box>
        </Paper>
      </div>

      <div id="section-data">
        <SectionHeader label={language === 'ja' ? 'データ管理' : 'Data Management'} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <ListItem button onClick={handleExportFile}>
              <ListItemIcon><ExportFileIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? '設定をファイルに出力' : 'Export to file'} secondary={language === 'ja' ? '設定をJSON形式で保存します' : 'Save settings as JSON'} />
            </ListItem>
            <Divider />
            <ListItem button component="label">
              <ListItemIcon><ImportFileIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? 'ファイルから復元' : 'Import from file'} secondary={language === 'ja' ? 'JSONファイルから設定を読み込みます' : 'Load settings from JSON'} />
              <input type="file" accept=".json" hidden onChange={handleImportFile} />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleExportQr}>
              <ListItemIcon><QrCodeIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? 'QRコードで引き継ぎ' : 'Transfer via QR Code'} secondary={language === 'ja' ? '他の端末に設定を引き継ぐためのQRを表示' : 'Show QR code for transfer'} />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => handleStartScan('import')}>
              <ListItemIcon><ScanIcon /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? 'QRコードをスキャン' : 'Scan QR Code'} secondary={language === 'ja' ? 'QRコードから設定をインポート' : 'Import settings by scanning QR'} />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => setShowDeleteConfirm(true)} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary={language === 'ja' ? '全データの削除' : 'Delete All Data'} secondary={language === 'ja' ? '設定と履歴をリセットします' : 'Reset settings and history'} />
            </ListItem>
          </List>
        </Paper>
      </div>
      <div id="section-about">
        <SectionHeader label={t.about} />
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ py: 1.5, cursor: 'pointer', userSelect: 'none' }} onClick={handleVersionTap}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText
                primary="Version"
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    1.2.0
                    {expUnlocked && (
                      <Chip label={language === 'ja' ? '実験的機能解除済' : 'Experimental unlocked'} size="small" color="warning" variant="outlined" sx={{ fontSize: '11px', height: 20 }} />
                    )}
                  </Box>
                }
              />
              <ChevronRightIcon sx={{ color: expUnlocked ? 'warning.main' : 'text.disabled', transition: 'color 0.2s' }} />
            </ListItem>
            {expUnlocked && (
              <>
                <Divider />
                <ListItem button onClick={() => { triggerHaptic(); navigate('/labs'); }}>
                  <ListItemIcon><LabsIcon color="warning" /></ListItemIcon>
                  <ListItemText primary={language === 'ja' ? '実験的機能設定' : 'Experimental Settings'} />
                  <ChevronRightIcon />
                </ListItem>
              </>
            )}
          </List>
        </Paper>
      </div>
    </>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', 
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'background.default' 
    }}>
      <PageHeader title={t.settings} />

      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
        {/* ── Desktop Sidebar ── */}
        {!isMobile && (
          <Box sx={{ 
            width: 280, 
            borderRight: '1px solid', 
            borderColor: 'divider', 
            bgcolor: 'background.paper',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 700 }}>Category</Typography>
            <List sx={{ p: 0 }}>
              {sidebarItems.map((item) => (
                <ListItem 
                  key={item.id}
                  onClick={() => scrollToSection(item.id as SectionId)}
                  sx={{ 
                    borderRadius: '12px', 
                    mb: 0.5, 
                    cursor: 'pointer',
                    bgcolor: activeSection === item.id ? 'primary.main' : 'transparent',
                    color: activeSection === item.id ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: activeSection === item.id ? 'primary.main' : 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <item.Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 'auto', p: 2, bgcolor: 'action.hover', borderRadius: '16px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GeneralIcon fontSize="small" color="disabled" />
                <Typography variant="caption" fontWeight={700} color="text.secondary">SYSTEM</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                Wholphin Search Client<br/>Version 1.2.0 (Stable)
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Main Content ── */}
        <Box
          ref={scrollRef}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            bgcolor: isMobile ? 'transparent' : 'background.default',
          }}
        >
          <PageTransition>
            <Container 
              maxWidth={isMobile ? "sm" : "md"} 
              sx={{ 
                py: isMobile ? 2 : 4, 
                px: isMobile ? 2 : 6,
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2 
              }}
            >
              {!isMobile && (
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                  {sidebarItems.find(s => s.id === activeSection)?.label}
                </Typography>
              )}

              {isMobile ? renderContent() : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   {renderContent()}
                </Box>
              )}
              
              <Box sx={{ height: 100 }} />
            </Container>
            <BottomNavSpacer />
          </PageTransition>
        </Box>
      </Box>

      {/* ── Dialogs ── */}
      <Dialog open={showWarning} onClose={() => setShowWarning(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" /> {language === 'ja' ? '実験的機能' : 'Experimental'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '14px' }}>
            {language === 'ja' ? '了承の上でご利用ください。' : 'Use at your own risk.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowWarning(false)}>Cancel</Button>
          <Button onClick={handleWarningOk} variant="contained" color="warning">Unlock</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{language === 'ja' ? '全データの削除' : 'Delete All Data'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {language === 'ja' ? 'すべての設定と検索履歴が完全に削除されます。この操作は取り消せません。' : 'All settings and search history will be permanently deleted. This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteAll} variant="contained" color="error">Delete Everything</Button>
        </DialogActions>
      </Dialog>

      {/* Generic QR Display Dialog */}
      <Dialog open={showQrExport || showSyncQr} onClose={() => { setShowQrExport(false); setShowSyncQr(false); }} PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
          {showSyncQr ? (language === 'ja' ? '同期ペアリング' : 'Sync Pairing') : (language === 'ja' ? '設定の引き継ぎ' : 'Transfer Settings')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box component="img" src={qrImageUrl} sx={{ width: '100%', maxWidth: 300, borderRadius: '16px' }} />
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {showSyncQr 
              ? (language === 'ja' ? 'もう一方の端末でこのQRをスキャンして同期を開始します' : 'Scan this QR code on the other device to start syncing')
              : (language === 'ja' ? '引き継ぎ先の端末でこのQRをスキャンしてください' : 'Scan this QR code on the destination device')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={() => { setShowQrExport(false); setShowSyncQr(false); }} variant="contained" sx={{ borderRadius: '12px' }}>Done</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showQrScanner} onClose={stopScan} fullScreen PaperProps={{ sx: { bgcolor: '#000' } }}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', left: 16, zIndex: 10 }}>
            <Button onClick={stopScan} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}>Cancel</Button>
          </Box>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 250, border: '2px solid #fff', borderRadius: '24px', boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)' }}>
            <Box sx={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderLeft: '4px solid #fff', borderTop: '4px solid #fff', borderTopLeftRadius: '24px' }} />
            <Box sx={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderRight: '4px solid #fff', borderTop: '4px solid #fff', borderTopRightRadius: '24px' }} />
            <Box sx={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderLeft: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomLeftRadius: '24px' }} />
            <Box sx={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderRight: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomRightRadius: '24px' }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 40px)', width: '100%', textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
              {scannerMode === 'sync' 
                ? (language === 'ja' ? '同期QRを枠に合わせてください' : 'Align Sync QR within the frame')
                : (language === 'ja' ? '設定QRを枠に合わせてください' : 'Align Settings QR within the frame')}
            </Typography>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={!!snackMsg} autoHideDuration={2000} onClose={() => setSnackMsg('')}
        message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { borderRadius: '12px' } }}
      />
    </Box>
  );
};

export default Settings;
