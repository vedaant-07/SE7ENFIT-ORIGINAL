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

// Use a less strict type to allow both dark and light colors
type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardElevated: string;
  popover: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  accentDim: string;
  accentBorder: string;
  accentSoft: string;
  destructive: string;
  destructiveForeground: string;
  destructiveSoft: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  success: string;
  warning: string;
  error: string;
};

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

const THEME_STORAGE_KEY = 'se7enfit_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // For now, default to dark theme
        // In a native build, use AsyncStorage or SecureStore
        setThemeState('dark');
      } catch {
        setThemeState('dark');
      }
    };
    loadTheme();
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    // In a native build, persist with AsyncStorage or SecureStore
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
