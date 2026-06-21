// Bottom navigation used inside the user app. Mirrors the web BottomNav:
// Home / Workout / AI / Challenges / Track. Renders a floating rounded bar.
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, View, Text } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Activity, Bot, Dumbbell, Home as HomeIcon, Trophy, type LucideIcon } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type NavItem = { href: string; icon: LucideIcon; label: string };

const NAV: NavItem[] = [
  { href: '/(user)', icon: HomeIcon, label: 'Home' },
  { href: '/(user)/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/(user)/ai-trainer', icon: Bot, label: 'AI' },
  { href: '/(user)/challenges', icon: Trophy, label: 'Challenges' },
  { href: '/(user)/tracking', icon: Activity, label: 'Track' },
];

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom,
        backgroundColor: 'rgba(13, 13, 13, 0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(41, 41, 41, 0.6)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/(user)' && path.startsWith(href));
          return (
            <Pressable
              key={href}
              onPress={() => router.replace(href)}
              style={({ pressed }) => ({
                alignItems: 'center',
                gap: 4,
                paddingVertical: 6,
                paddingHorizontal: 16,
                borderRadius: radius.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', width: 40, height: 32 }}>
                {active && <View style={{ position: 'absolute', inset: 0, backgroundColor: colors.accentSoft, borderRadius: radius.md }} />}
                <Icon size={20} color={active ? colors.accent : colors.mutedForeground} strokeWidth={active ? 2.5 : 1.8} />
              </View>
              <Text style={{ fontSize: 10, fontFamily: active ? typography.bodySemibold : typography.body, color: active ? colors.accent : colors.mutedForeground }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
