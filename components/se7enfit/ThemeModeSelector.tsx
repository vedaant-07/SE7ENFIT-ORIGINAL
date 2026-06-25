import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { Check, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode } from '@/constants/theme';

type Props = {
  style?: ViewStyle;
  compact?: boolean;
};

const OPTIONS: Array<{ mode: ThemeMode; label: string; description: string; icon: typeof Moon }> = [
  { mode: 'dark', label: 'Dark', description: 'Black premium SE7EN FIT look', icon: Moon },
  { mode: 'light', label: 'Light', description: 'Clean bright daytime look', icon: Sun },
];

export default function ThemeModeSelector({ style, compact = false }: Props) {
  const { colors, spacing, radius, typography, theme, setTheme } = useTheme();

  return (
    <View style={[{ gap: spacing.sm }, style]}>
      {!compact ? (
        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>
            Theme
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
            Choose dark or light mode for the whole app.
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = theme === option.mode;

          return (
            <Pressable
              key={option.mode}
              onPress={() => setTheme(option.mode)}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${option.label} theme`}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: compact ? 44 : 72,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.border,
                backgroundColor: active ? colors.accentSoft : colors.cardElevated,
                padding: compact ? spacing.sm : spacing.md,
                opacity: pressed ? 0.82 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              })}
            >
              <View
                style={{
                  width: compact ? 28 : 36,
                  height: compact ? 28 : 36,
                  borderRadius: compact ? 9 : 12,
                  backgroundColor: active ? colors.accent : colors.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={compact ? 15 : 18} color={active ? colors.accentForeground : colors.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: compact ? 12 : 14, color: colors.foreground }}>
                  {option.label}
                </Text>
                {!compact ? (
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {active ? <Check size={16} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
