import { Text, View, type ViewStyle } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Card from './Card';

export function SectionHeader({ title, action, style }: { title: string; action?: string; style?: ViewStyle }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, ...style }}>
      <Text style={{ flex: 1, fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>
        {title}
      </Text>
      {action ? (
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 11, color: colors.accent }}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  const { colors, radius, typography } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.full,
        backgroundColor: active ? colors.accent : colors.card,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
      }}
    >
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: active ? colors.accentForeground : colors.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

export function IconTile({
  icon: Icon,
  label,
  value,
  color,
  style,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  color?: string;
  style?: ViewStyle;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const tint = color ?? colors.accent;
  return (
    <Card padded={false} style={{ padding: spacing.md, minHeight: 86, ...style }}>
      <View style={{ width: 34, height: 34, borderRadius: radius.md, backgroundColor: `${tint}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={18} color={tint} />
      </View>
      {value ? (
        <Text style={{ fontFamily: typography.headingBold, fontSize: 17, color: colors.foreground, marginBottom: 2 }}>
          {value}
        </Text>
      ) : null}
      <Text style={{ fontFamily: typography.bodyMedium, fontSize: 11, color: colors.mutedForeground }} numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

export function MetricTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const { colors, typography } = useTheme();
  return (
    <Card padded={false} style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: accent ?? colors.foreground }}>
        {value}
      </Text>
      <Text style={{ marginTop: 2, fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground }}>
        {label}
      </Text>
    </Card>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { colors, radius } = useTheme();
  const progress = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
      <View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: radius.full, backgroundColor: color ?? colors.accent }} />
    </View>
  );
}

export function EmptyState({ icon: Icon, title, caption }: { icon: LucideIcon; title: string; caption?: string }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <View style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
        <Icon size={22} color={colors.accent} />
      </View>
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, textAlign: 'center' }}>
        {title}
      </Text>
      {caption ? (
        <Text style={{ marginTop: 5, fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, textAlign: 'center' }}>
          {caption}
        </Text>
      ) : null}
    </Card>
  );
}
