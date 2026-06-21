// Empty state — shown when a list has no items yet.
import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 1.5 }}>
      {icon ? <View style={{ marginBottom: spacing.md, opacity: 0.5 }}>{icon}</View> : null}
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 15, color: colors.foreground, textAlign: 'center' }}>{title}</Text>
      {subtitle ? <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 6, paddingHorizontal: spacing.xl }}>{subtitle}</Text> : null}
    </View>
  );
}
