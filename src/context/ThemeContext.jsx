import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  mode: 'light',
  setMode: () => {},
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('andal_theme_mode') || 'light';
  });

  const [appliedTheme, setAppliedTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;

    const apply = (themeValue) => {
      setAppliedTheme(themeValue);
      root.setAttribute('data-theme', themeValue);
      if (themeValue === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e) => apply(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      apply(mode);
    }

    localStorage.setItem('andal_theme_mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme: appliedTheme, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
