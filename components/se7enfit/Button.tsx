// SE7EN-FIT button — mirrors the web app's rounded, accent/outline variants.
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  label?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
} & Omit<PressableProps, 'children' | 'disabled'>;

export default function Button({
  label,
  children,
  variant = 'accent',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = true,
  ...props
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const height = size === 'sm' ? 40 : size === 'md' ? 48 : 56;
  const fontSize = size === 'sm' ? 13 : size === 'md' ? 15 : 16;

  const { bg, text, border, borderWidth } = useMemo(() => {
    if (disabled) {
      return {
        bg: colors.secondary,
        text: colors.mutedForeground,
        border: 'transparent',
        borderWidth: 0,
      };
    }
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: colors.primaryForeground,
          border: 'transparent',
          borderWidth: 0,
        };
      case 'accent':
        return {
          bg: colors.accent,
          text: colors.accentForeground,
          border: 'transparent',
          borderWidth: 0,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.foreground,
          border: colors.accentBorder,
          borderWidth: 2,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.foreground,
          border: 'transparent',
          borderWidth: 0,
        };
      case 'destructive':
        return {
          bg: colors.destructive,
          text: colors.destructiveForeground,
          border: 'transparent',
          borderWidth: 0,
        };
    }
  }, [variant, disabled, colors]);

  return (
    <Pressable
      style={({ pressed }) => ({
        height,
        borderRadius: radius.md,
        backgroundColor: bg,
        borderWidth,
        borderColor: border,
        opacity: disabled ? 1 : pressed ? 0.86 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        transform: [{ scale: disabled ? 1 : 1 }],
      })}
      disabled={disabled || loading}
      accessibilityRole="button"
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={text} />}
      {children}
      {label && (
        <Text
          style={{
            color: text,
            fontFamily: typography.bodySemibold,
            fontSize,
            includeFontPadding: false,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
