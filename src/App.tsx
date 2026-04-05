import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { init } from '@yunfie/search-js';
import { API_BASE } from './config';
import { useAppTheme } from './theme';
import GlobalAppStyles from './components/GlobalAppStyles';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  const theme = useAppTheme();

  useEffect(() => {
    init({ API_BASE });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalAppStyles />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
