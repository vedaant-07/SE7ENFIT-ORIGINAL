import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'destructive' | 'soft';
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
  const height = size === 'sm' ? 38 : size === 'md' ? 46 : 54;
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 14 : 15;

  const { bg, text, border, borderWidth } = useMemo(() => {
    if (disabled) {
      return {
        bg: colors.secondary,
        text: colors.mutedForeground,
        border: colors.border,
        borderWidth: 1,
      };
    }
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.primaryForeground, border: 'transparent', borderWidth: 0 };
      case 'accent':
        return { bg: colors.accent, text: colors.accentForeground, border: 'transparent', borderWidth: 0 };
      case 'soft':
        return { bg: colors.accentSoft, text: colors.accent, border: colors.accentBorder, borderWidth: 1 };
      case 'outline':
        return { bg: colors.card, text: colors.foreground, border: colors.accentBorder, borderWidth: 1 };
      case 'ghost':
        return { bg: 'transparent', text: colors.foreground, border: 'transparent', borderWidth: 0 };
      case 'destructive':
        return { bg: colors.destructiveSoft, text: colors.error, border: 'rgba(239, 68, 68, 0.24)', borderWidth: 1 };
    }
  }, [variant, disabled, colors]);

  return (
    <Pressable
      style={({ pressed }) => ({
        minHeight: height,
        borderRadius: radius.md,
        backgroundColor: bg,
        borderWidth,
        borderColor: border,
        opacity: disabled ? 1 : pressed ? 0.84 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        shadowColor: variant === 'accent' ? colors.accent : '#000000',
        shadowOpacity: variant === 'accent' ? 0.28 : 0,
        shadowRadius: variant === 'accent' ? 14 : 0,
        shadowOffset: { width: 0, height: 6 },
        elevation: variant === 'accent' ? 2 : 0,
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
