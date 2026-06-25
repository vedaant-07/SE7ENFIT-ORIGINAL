// Theme Context - SE7EN FIT
// Provides persisted dark/light theme switching across user and gym-owner app areas.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, spacing, radius, typography, fontSizes, lineHeights } from '@/constants/theme';
import type { ThemeMode } from '@/constants/theme';

type ThemeColors = Record<keyof typeof darkColors, string>;

type ThemeContextValue = {
  theme: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'se7enfit_theme_mode';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'dark' || value === 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && isThemeMode(savedTheme)) {
          setThemeState(savedTheme);
        }
      } catch {
        if (mounted) setThemeState('dark');
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Theme still changes for the current session even if persistence fails.
    }
  };

  const toggleTheme = async () => {
    await setTheme(theme === 'dark' ? 'light' : 'dark');
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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
