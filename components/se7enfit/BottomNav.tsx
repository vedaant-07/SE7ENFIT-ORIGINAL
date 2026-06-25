import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, View, Text } from 'react-native';
import { usePathname, useRouter, type Href } from 'expo-router';
import { Activity, Bot, Dumbbell, Home as HomeIcon, Trophy, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type NavItem = { href: Href; activePath: string; icon: LucideIcon; label: string };

const NAV: NavItem[] = [
  { href: '/(user)', activePath: '/(user)', icon: HomeIcon, label: 'Home' },
  { href: '/(user)/workout', activePath: '/(user)/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/(user)/ai-trainer', activePath: '/(user)/ai-trainer', icon: Bot, label: 'AI' },
  { href: '/(user)/challenges', activePath: '/(user)/challenges', icon: Trophy, label: 'Challenge' },
  { href: '/(user)/tracking', activePath: '/(user)/tracking', icon: Activity, label: 'Track' },
];

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingTop: spacing.sm,
        backgroundColor: 'rgba(2, 4, 3, 0.96)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.glass,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
        }}
      >
        {NAV.map(({ href, activePath, icon: Icon, label }) => {
          const active = path === activePath || (activePath !== '/(user)' && path.startsWith(activePath));
          return (
            <Pressable
              key={activePath}
              onPress={() => router.replace(href)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                paddingVertical: 8,
                borderRadius: radius.lg,
                backgroundColor: active ? colors.accentSoft : 'transparent',
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  width: 30,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.full,
                }}
              >
                <Icon size={19} color={active ? colors.accent : colors.mutedForeground} strokeWidth={active ? 2.6 : 1.9} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 9,
                  fontFamily: active ? typography.bodySemibold : typography.body,
                  color: active ? colors.accent : colors.mutedForeground,
                  includeFontPadding: false,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
