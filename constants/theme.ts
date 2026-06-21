// SE7EN FIT brand theme — Dark and Light modes.
// Pure black/white backgrounds, neon green accent, Inter body + Space Grotesk headings.

export type ThemeMode = 'dark' | 'light';

// Dark theme colors (default)
export const darkColors = {
  background: '#050505',
  foreground: '#FAFAFA',
  card: '#0D0D0D',
  cardElevated: '#171717',
  popover: '#0D0D0D',
  primary: '#FAFAFA',
  primaryForeground: '#0F0F0F',
  secondary: '#1F1F1F',
  secondaryForeground: '#FAFAFA',
  muted: '#1F1F1F',
  mutedForeground: '#8C8C8C',
  accent: '#29E06B',
  accentForeground: '#000000',
  accentDim: 'rgba(41, 224, 107, 0.10)',
  accentBorder: 'rgba(41, 224, 107, 0.30)',
  accentSoft: 'rgba(41, 224, 107, 0.15)',
  destructive: '#7F1D1D',
  destructiveForeground: '#FAFAFA',
  destructiveSoft: 'rgba(127, 29, 29, 0.20)',
  border: '#292929',
  input: '#292929',
  ring: '#29E06B',
  chart1: '#29E06B',
  chart2: '#2DBA7A',
  chart3: '#E08A33',
  chart4: '#9D5CD6',
  chart5: '#E8527A',
  success: '#29E06B',
  warning: '#F5A623',
  error: '#EF4444',
} as const;

// Light theme colors
export const lightColors = {
  background: '#FFFFFF',
  foreground: '#0F0F0F',
  card: '#F5F5F5',
  cardElevated: '#FFFFFF',
  popover: '#FFFFFF',
  primary: '#0F0F0F',
  primaryForeground: '#FFFFFF',
  secondary: '#E5E5E5',
  secondaryForeground: '#0F0F0F',
  muted: '#E5E5E5',
  mutedForeground: '#737373',
  accent: '#29E06B',
  accentForeground: '#000000',
  accentDim: 'rgba(41, 224, 107, 0.10)',
  accentBorder: 'rgba(41, 224, 107, 0.30)',
  accentSoft: 'rgba(41, 224, 107, 0.15)',
  destructive: '#FEE2E2',
  destructiveForeground: '#0F0F0F',
  destructiveSoft: 'rgba(239, 68, 68, 0.10)',
  border: '#E5E5E5',
  input: '#E5E5E5',
  ring: '#29E06B',
  chart1: '#29E06B',
  chart2: '#2DBA7A',
  chart3: '#E08A33',
  chart4: '#9D5CD6',
  chart5: '#E8527A',
  success: '#29E06B',
  warning: '#F5A623',
  error: '#EF4444',
} as const;

// For backward compatibility, export dark colors as default
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const typography = {
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemibold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
  heading: 'SpaceGrotesk-Medium',
  headingBold: 'SpaceGrotesk-Bold',
  display: 'SpaceGrotesk-Bold',
} as const;

export const fontSizes = {
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  hero: 42,
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.6,
} as const;
