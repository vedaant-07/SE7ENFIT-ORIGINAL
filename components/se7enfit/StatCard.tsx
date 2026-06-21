// Stat card — single metric with icon, large value, caption.
import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function StatCard({
  icon,
  label,
  value,
  caption,
  color = colors.accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  caption?: string;
  color?: string;
}) {
  return (
    <View style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${color}20`, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
        {icon}
      </View>
      <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontFamily: typography.headingBold, fontSize: 20, color: colors.foreground, marginTop: 2 }}>{value}</Text>
      {caption ? <Text style={{ fontFamily: typography.body, fontSize: 11, color, marginTop: 2 }}>{caption}</Text> : null}
    </View>
  );
}
