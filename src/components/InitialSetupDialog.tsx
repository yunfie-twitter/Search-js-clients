import React, { memo, useState, useRef, ChangeEvent } from 'react';
import { 
  Dialog, Typography, Box, Button, MobileStepper, Stack,
  Switch, ListItem, ListItemText, Paper,
  ToggleButtonGroup, ToggleButton, Slide, Fade, Divider, keyframes, TextField, InputAdornment
} from '@mui/material';
import { 
  AutoAwesomeOutlined as MagicIcon,
  PaletteOutlined as ThemeIcon,
  RocketLaunchOutlined as StartIcon,
  CloudUploadOutlined as ImportIcon,
  FiberNewOutlined as NewIcon,
  VpnKeyOutlined as KeyIcon,
  PsychologyOutlined as AiIcon,
  LanguageOutlined as LangIcon,
  CheckCircleOutlined as CheckIcon,
  BoltOutlined as SpeedIcon,
  ShieldOutlined as PrivacyIcon,
  SearchOutlined as SearchIcon,
  QrCodeScannerOutlined as ScanIcon
} from '@mui/icons-material';
import { useSearchStore } from '../store/useSearchStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerHaptic } from '../utils/haptics';
import translations from '../translations';
import jsQR from 'jsqr';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Props {
  open: boolean;
  onClose: () => void;
}

const InitialSetupDialog: React.FC<Props> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [userType, setUserType] = useState<'new' | 'existing' | null>(null);
  const [hasExportFile, setHasExportFile] = useState<'yes' | 'no' | 'qr' | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    language, setLanguage, setHasCompletedSetup, 
    themeMode, setThemeMode,
    safeSearch, setSafeSearch,
    expAiSummary, setExpAiSummary,
    geminiApiKey, setGeminiApiKey,
    expFrostGlass, setExpFrostGlass,
    expScrollHeader, setExpScrollHeader,
    resultsPerPage, setResultsPerPage,
    importData, setSyncGroupId, setSyncServerUrl, setEnableSync
  } = useSearchStore(useShallow(s => ({
    language: s.language,
    setLanguage: s.setLanguage,
    setHasCompletedSetup: s.setHasCompletedSetup,
    themeMode: s.themeMode,
    setThemeMode: s.setThemeMode,
    safeSearch: s.safeSearch,
    setSafeSearch: s.setSafeSearch,
    expAiSummary: s.expAiSummary,
    setExpAiSummary: s.setExpAiSummary,
    geminiApiKey: s.geminiApiKey,
    setGeminiApiKey: s.setGeminiApiKey,
    expFrostGlass: s.expFrostGlass,
    setExpFrostGlass: s.setExpFrostGlass,
    expScrollHeader: s.expScrollHeader,
    setExpScrollHeader: s.setExpScrollHeader,
    resultsPerPage: s.resultsPerPage,
    setResultsPerPage: s.setResultsPerPage,
    importData: s.importData,
    setSyncGroupId: s.setSyncGroupId,
    setSyncServerUrl: s.setSyncServerUrl,
    setEnableSync: s.setEnableSync
  })));

  const premiumButtonStyle = {
    borderRadius: '12px',
    textTransform: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:active': { transform: 'scale(0.96)', filter: 'brightness(0.9)' }
  };

  const handleNext = () => {
    triggerHaptic();
    setDirection('left');
    if (activeStep === 0) { setActiveStep(1); return; }
    if (activeStep === 1) { setActiveStep(2); return; }
    if (activeStep === 7) { setHasCompletedSetup(true); onClose(); }
    else { setActiveStep((prev) => prev + 1); }
  };

  const handleBack = () => {
    triggerHaptic();
    setDirection('right');
    if (activeStep === 4 && userType === 'new') setActiveStep(2);
    else setActiveStep((prev) => prev - 1);
  };

  const handleUserTypeChoice = (type: 'new' | 'existing') => {
    triggerHaptic();
    setUserType(type);
    setDirection('left');
    if (type === 'new') setActiveStep(4);
    else setActiveStep(3);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        if (importData(json)) {
          triggerHaptic();
          window.location.reload();
        } else { alert('Invalid file'); }
      } catch (err) { alert('Invalid file'); }
    };
    reader.readAsText(file);
  };

  const handleStartScan = async () => {
    setHasExportFile('qr');
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
      alert('Camera access denied');
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !showQrScanner) return;
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const scale = 0.5;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code) {
          if (handleScannedResult(code.data)) return;
        }
      }
    }
    requestAnimationFrame(scanFrame);
  };

  const handleScannedResult = (data: string): boolean => {
    // 1. 同期ペアリングQRのチェック
    try {
      const syncObj = JSON.parse(data);
      if (syncObj.id && syncObj.srv) {
        setSyncGroupId(syncObj.id);
        setSyncServerUrl(syncObj.srv);
        setEnableSync(true);
        setHasCompletedSetup(true);
        triggerHaptic();
        stopScan();
        window.location.reload();
        return true;
      }
    } catch (e) { /* ignore */ }

    // 2. フルバックアップQRのチェック
    if (importData(data)) {
      triggerHaptic();
      stopScan();
      window.location.reload();
      return true;
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

  const steps = [
    {
      title: 'Language',
      desc: '言語を選択してください',
      icon: <LangIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      content: (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Button fullWidth variant={language === 'ja' ? 'contained' : 'outlined'} onClick={() => { setLanguage('ja'); triggerHaptic(); }} sx={{ ...premiumButtonStyle, py: 1.2, border: '2px solid', fontWeight: 700 }}>日本語</Button>
          <Button fullWidth variant={language === 'en' ? 'contained' : 'outlined'} onClick={() => { setLanguage('en'); triggerHaptic(); }} sx={{ ...premiumButtonStyle, py: 1.2, border: '2px solid', fontWeight: 700 }}>English</Button>
        </Stack>
      )
    },
    {
      title: 'Wholphin',
      desc: language === 'ja' ? '次世代の検索体験' : 'Next-gen search.',
      icon: <MagicIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      content: (
        <Box sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <SpeedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Box><Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1 }}>{language === 'ja' ? '爆速検索' : 'Fast'}</Typography>
              <Typography variant="caption" color="text.secondary">{language === 'ja' ? '一瞬で答えを引き出す' : 'Instant results.'}</Typography></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <AiIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
              <Box><Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1 }}>{language === 'ja' ? 'AIアシスタント' : 'AI Assistant'}</Typography>
              <Typography variant="caption" color="text.secondary">{language === 'ja' ? 'Geminiが情報を自動要約' : 'Smart summaries.'}</Typography></Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <PrivacyIcon sx={{ fontSize: 28, color: 'success.main' }} />
              <Box><Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1 }}>{language === 'ja' ? 'プライバシー' : 'Private'}</Typography>
              <Typography variant="caption" color="text.secondary">{language === 'ja' ? 'データは端末内にのみ保存' : 'On-device storage.'}</Typography></Box>
            </Box>
          </Stack>
        </Box>
      )
    },
    {
      title: '利用状況',
      desc: '利用経験を選択してください',
      icon: <NewIcon sx={{ fontSize: 48, color: 'text.primary' }} />,
      content: (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => handleUserTypeChoice('new')} sx={{ ...premiumButtonStyle, py: 1.6, border: '2px solid', fontWeight: 700 }}>初めて利用する</Button>
          <Button fullWidth variant="outlined" onClick={() => handleUserTypeChoice('existing')} sx={{ ...premiumButtonStyle, py: 1.6, border: '2px solid', fontWeight: 700 }}>以前使っていた</Button>
        </Stack>
      )
    },
    {
      title: '復旧',
      desc: '設定をインポートします',
      icon: <ImportIcon sx={{ fontSize: 48, color: 'text.primary' }} />,
      content: (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {(hasExportFile === null || hasExportFile === 'no') ? (
            <Stack spacing={1}>
              <Button fullWidth variant="outlined" onClick={() => { triggerHaptic(); setHasExportFile('yes'); }} sx={{ ...premiumButtonStyle, py: 1.4, border: '2px solid', fontWeight: 700 }}>ファイルを選択</Button>
              <Button fullWidth variant="outlined" onClick={handleStartScan} startIcon={<ScanIcon />} sx={{ ...premiumButtonStyle, py: 1.4, border: '2px solid', fontWeight: 700 }}>QRコードで引き継ぐ</Button>
              <Button fullWidth variant="text" onClick={() => { triggerHaptic(); setActiveStep(4); }} sx={{ mt: 1, fontWeight: 600, color: 'text.secondary' }}>最初から設定する</Button>
            </Stack>
          ) : hasExportFile === 'yes' ? (
            <Box sx={{ textAlign: 'center' }}>
              <input accept=".json" style={{ display: 'none' }} id="import-file" type="file" onChange={handleImport} />
              <label htmlFor="import-file"><Button variant="contained" component="span" sx={{ ...premiumButtonStyle, py: 1.4, px: 4, fontWeight: 700 }}>ファイルを選択</Button></label>
              <Button variant="text" onClick={() => setHasExportFile(null)} sx={{ mt: 1, color: 'text.secondary', fontWeight: 600, display: 'block', mx: 'auto' }}>戻る</Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Button fullWidth variant="contained" onClick={handleStartScan} startIcon={<ScanIcon />} sx={{ ...premiumButtonStyle, py: 1.4, fontWeight: 700 }}>スキャンを開始</Button>
              <Button variant="text" onClick={() => setHasExportFile(null)} sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}>戻る</Button>
            </Box>
          )}
        </Stack>
      )
    },
    {
      title: '外観',
      desc: 'デザインのカスタマイズ',
      icon: <ThemeIcon sx={{ fontSize: 48, color: 'text.primary' }} />,
      content: (
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, mb: 0.5, display: 'block', fontWeight: 700 }}>テーマ</Typography>
            <ToggleButtonGroup fullWidth value={themeMode} exclusive onChange={(_, v) => v && setThemeMode(v)} size="small" sx={{ bgcolor: 'action.hover', borderRadius: '10px', p: 0.5 }}>
              <ToggleButton value="light" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Light</ToggleButton>
              <ToggleButton value="system" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Auto</ToggleButton>
              <ToggleButton value="dark" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Dark</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Paper elevation={0} sx={{ borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <ListItem sx={{ py: 0.2 }}>
              <ListItemText primary="グラスエフェクト" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} />
              <Switch checked={expFrostGlass} onChange={(e) => setExpFrostGlass(e.target.checked)} size="small" />
            </ListItem>
            <Divider />
            <ListItem sx={{ py: 0.2 }}>
              <ListItemText primary="ヘッダー自動非表示" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} />
              <Switch checked={expScrollHeader} onChange={(e) => setExpScrollHeader(e.target.checked)} size="small" />
            </ListItem>
          </Paper>
        </Stack>
      )
    },
    {
      title: '検索',
      desc: '効率と安全性を設定',
      icon: <SearchIcon sx={{ fontSize: 48, color: 'text.primary' }} />,
      content: (
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, mb: 0.5, display: 'block', fontWeight: 700 }}>表示件数</Typography>
            <ToggleButtonGroup fullWidth value={String(resultsPerPage)} exclusive onChange={(_, v) => v && setResultsPerPage(Number(v) as any)} size="small" sx={{ bgcolor: 'action.hover', borderRadius: '10px', p: 0.5 }}>
              <ToggleButton value="10" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>10件</ToggleButton>
              <ToggleButton value="20" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>20件</ToggleButton>
              <ToggleButton value="50" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>50件</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, mb: 0.5, display: 'block', fontWeight: 700 }}>セーフサーチ</Typography>
            <ToggleButtonGroup fullWidth value={safeSearch} exclusive onChange={(_, v) => v && setSafeSearch(v)} size="small" sx={{ bgcolor: 'action.hover', borderRadius: '10px', p: 0.5 }}>
              <ToggleButton value="off" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>Off</ToggleButton>
              <ToggleButton value="moderate" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>通常</ToggleButton>
              <ToggleButton value="strict" sx={{ border: 'none', borderRadius: '8px !important', py: 0.6, fontSize: '0.75rem', fontWeight: 600 }}>厳格</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      )
    },
    {
      title: 'AI要約',
      desc: 'Geminiによる自動整理',
      icon: <AiIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      content: (
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, display: 'block', px: 1 }}>
            Gemini Proが複数の記事を瞬時に要約。答えをすぐに見つけられます。取得したAPIキーは端末内に安全に保存されます。
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText primary="AI要約を有効にする" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} />
              <Switch checked={expAiSummary} onChange={(e) => setExpAiSummary(e.target.checked)} size="small" />
            </ListItem>
            {expAiSummary && (
              <Fade in={expAiSummary}>
                <Box sx={{ px: 1.5, pb: 1.5 }}>
                  <TextField
                    fullWidth size="small" placeholder="AIZA..." value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)}
                    label="API Key" InputProps={{ startAdornment: <InputAdornment position="start"><KeyIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: '10px', bgcolor: 'background.paper', fontSize: '0.8rem' } }}
                  />
                </Box>
              </Fade>
            )}
          </Paper>
        </Stack>
      )
    },
    {
      title: '準備完了',
      desc: 'すべての設定が完了しました',
      icon: <StartIcon sx={{ fontSize: 56, color: 'primary.main' }} />,
      content: (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>パーソナライズされたWholphinを<br/>お楽しみください。</Typography>
        </Box>
      )
    }
  ];

  return (
    <Dialog open={open} fullScreen PaperProps={{ sx: { bgcolor: 'background.default', backgroundImage: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 0 } }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {steps.map((step, index) => (
          <Slide key={index} direction={direction === 'left' ? 'left' : 'right'} in={activeStep === index} mountOnEnter unmountOnExit timeout={400}>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pt: 'calc(env(safe-area-inset-top) + 16px)', px: 2.5, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mb: 1.5, animation: `${slideUp} 0.5s ease-out both` }}>{step.icon}</Box>
                <Box sx={{ textAlign: 'center', mb: 1.5, animation: `${slideUp} 0.5s ease-out 0.1s both` }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.2, letterSpacing: '-0.02em' }}>{step.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem' }}>{step.desc}</Typography>
                </Box>
                <Box sx={{ width: '100%', maxWidth: '320px', mx: 'auto', animation: `${slideUp} 0.5s ease-out 0.2s both` }}>{step.content}</Box>
              </Box>
            </Box>
          </Slide>
        ))}
      </Box>

      <Box sx={{ px: 3, pb: 'calc(env(safe-area-inset-bottom) + 12px)', pt: 1, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
        <MobileStepper variant="dots" steps={8} position="static" activeStep={activeStep} sx={{ bgcolor: 'transparent', justifyContent: 'center', mb: 1, '& .MuiMobileStepper-dot': { width: 5, height: 5 } }} backButton={null} nextButton={null} />
        <Stack spacing={0.5}>
          {(activeStep !== 2 && activeStep !== 3) && (
            <Button fullWidth variant="contained" onClick={handleNext} sx={{ ...premiumButtonStyle, py: 1.2, fontSize: '16px', fontWeight: 800, boxShadow: 'none' }}>
              {activeStep === 7 ? (language === 'ja' ? 'はじめる' : 'Start') : (language === 'ja' ? '続ける' : 'Continue')}
            </Button>
          )}
          <Box sx={{ minHeight: 32, display: 'flex', justifyContent: 'center' }}>
            {activeStep > 0 && <Button variant="text" onClick={handleBack} sx={{ py: 0.5, px: 3, fontWeight: 600, color: 'text.secondary', textTransform: 'none', fontSize: '14px', borderRadius: '10px' }}>{language === 'ja' ? '戻る' : 'Back'}</Button>}
          </Box>
        </Stack>
      </Box>

      <Dialog open={showQrScanner} onClose={stopScan} fullScreen PaperProps={{ sx: { bgcolor: '#000' } }}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', left: 16, zIndex: 10 }}>
            <Button onClick={stopScan} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}>キャンセル</Button>
          </Box>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 250, border: '2px solid #fff', borderRadius: '24px', boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)' }}>
            <Box sx={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderLeft: '4px solid #fff', borderTop: '4px solid #fff', borderTopLeftRadius: '24px' }} />
            <Box sx={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderRight: '4px solid #fff', borderTop: '4px solid #fff', borderTopRightRadius: '24px' }} />
            <Box sx={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderLeft: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomLeftRadius: '24px' }} />
            <Box sx={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderRight: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomRightRadius: '24px' }} />
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default memo(InitialSetupDialog);
