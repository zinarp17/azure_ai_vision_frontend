import React from 'react';
import './App.css';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Landing from './components/Landing';

function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'dark'
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          ...(mode === 'dark'
            ? { background: { default: '#0e0f13', paper: '#151821' } }
            : {}),
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Landing isDarkMode={mode === 'dark'} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}

export default App;
