import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
          overflow: 'hidden',
          touchAction: 'none'
        }}>
          <Container maxWidth="xs">
            <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: '24px' }}>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Something went wrong</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                {this.state.error?.message || 'An unexpected error occurred. Please try returning to the home page.'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
                sx={{ borderRadius: '12px', px: 4, py: 1.2, textTransform: 'none', fontWeight: 600 }}
              >
                Return to Home
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
