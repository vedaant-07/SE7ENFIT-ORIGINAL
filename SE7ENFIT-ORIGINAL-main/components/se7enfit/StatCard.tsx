// Stat card — single metric with icon, large value, caption.
import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function StatCard({
  icon,
  label,
  value,
  caption,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  caption?: string;
  color?: string;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const accentColor = color || colors.accent;

  return (
    <View style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${accentColor}20`, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
        {icon}
      </View>
      <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontFamily: typography.headingBold, fontSize: 20, color: colors.foreground, marginTop: 2 }}>{value}</Text>
      {caption ? <Text style={{ fontFamily: typography.body, fontSize: 11, color: accentColor, marginTop: 2 }}>{caption}</Text> : null}
    </View>
  );
}
