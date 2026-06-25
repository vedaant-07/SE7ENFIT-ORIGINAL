// Theme Context - SE7EN FIT
// Provides dark/light theme switching across the app.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, spacing, radius, typography, fontSizes, lineHeights } from '@/constants/theme';
import type { ThemeMode } from '@/constants/theme';

type ThemeColors = typeof darkColors;

type ThemeContextValue = {
  theme: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // The real SE7EN FIT screenshots use dark mode as the product default.
        setThemeState('dark');
      } catch {
        setThemeState('dark');
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors,
      spacing,
      radius,
      typography,
      fontSizes,
      lineHeights,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
