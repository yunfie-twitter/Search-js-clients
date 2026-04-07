import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { init } from '@yunfie/search-js';
import { API_BASE } from './config';
import { useAppTheme } from './theme';
import GlobalAppStyles from './components/GlobalAppStyles';
import AppRoutes from './AppRoutes';
import { useSearchStore } from './store/useSearchStore';
import { useLenis } from './hooks/useLenis';

const AppInner: React.FC = () => {
  const expLenis = useSearchStore((s) => s.expLenis);
  useLenis(expLenis);
  return <AppRoutes />;
};

const App: React.FC = () => {
  const theme = useAppTheme();

  useEffect(() => {
    init({ API_BASE, TIMEOUT: 20000 });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalAppStyles />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
