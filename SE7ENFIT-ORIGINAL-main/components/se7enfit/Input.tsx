// SE7EN-FIT input — matches the web app's outlined-on-dark text fields with
// an optional left icon (e.g. Mail, Lock).
import { forwardRef, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  label?: string;
  leftIcon?: ReactNode;
  errorText?: string;
  hint?: ReactNode;
} & TextInputProps;

const Input = forwardRef<TextInput, Props>(function Input(
  { label, leftIcon, errorText, hint, style, ...props },
  ref,
) {
  const { colors, radius, spacing, typography } = useTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, color: colors.foreground, opacity: 0.9 }}>
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        style={[
          {
            height: 52,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: hasError ? colors.error : colors.input,
            backgroundColor: 'transparent',
            color: colors.foreground,
            fontFamily: typography.body,
            fontSize: 16,
            paddingHorizontal: spacing.md,
            paddingLeft: leftIcon ? spacing.md + 28 : spacing.md,
            includeFontPadding: false,
          },
          style,
        ]}
        {...props}
      />
      {leftIcon && (
        <View
          style={{
            position: 'absolute',
            left: spacing.md,
            top: label ? 30 : 14,
            pointerEvents: 'none',
          }}
        >
          {leftIcon}
        </View>
      )}
      {hasError ? (
        <Text style={{ color: colors.error, fontFamily: typography.body, fontSize: 12 }}>{errorText}</Text>
      ) : hint ? (
        <View>{hint}</View>
      ) : null}
    </View>
  );
});

export default Input;
