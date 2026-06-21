// Inline error banner used across auth screens — mirrors web's destructive box.
import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = { children: ReactNode };

export default function ErrorBanner({ children }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  if (!children) return null;

  return (
    <View
      style={{
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.destructiveSoft,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
      }}
    >
      <Text style={{ color: '#FCA5A5', fontFamily: typography.body, fontSize: 14 }}>
        {typeof children === 'string' ? children : null}
        {typeof children !== 'string' ? children : null}
      </Text>
    </View>
  );
}
