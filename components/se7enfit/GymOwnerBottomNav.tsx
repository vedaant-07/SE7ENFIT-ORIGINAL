import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter, type Href } from 'expo-router';
import { BarChart3, Home, Settings, UserPlus, Users, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type OwnerNavItem = {
  href: Href;
  activePath: string;
  label: string;
  icon: LucideIcon;
};

const OWNER_NAV: OwnerNavItem[] = [
  { href: '/(gym-owner)/dashboard', activePath: '/(gym-owner)/dashboard', label: 'Home', icon: Home },
  { href: '/(gym-owner)/members', activePath: '/(gym-owner)/members', label: 'Members', icon: Users },
  { href: '/(gym-owner)/leads', activePath: '/(gym-owner)/leads', label: 'Leads', icon: UserPlus },
  { href: '/(gym-owner)/earnings', activePath: '/(gym-owner)/earnings', label: 'Earnings', icon: BarChart3 },
  { href: '/(gym-owner)/gym-profile', activePath: '/(gym-owner)/gym-profile', label: 'Settings', icon: Settings },
];

export default function GymOwnerBottomNav() {
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
        paddingTop: spacing.sm,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        backgroundColor: 'rgba(2, 4, 3, 0.96)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.glass,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
        }}
      >
        {OWNER_NAV.map(({ href, activePath, label, icon: Icon }) => {
          const active = path === activePath || path.startsWith(`${activePath}/`);
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
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Icon size={19} color={active ? colors.accent : colors.mutedForeground} strokeWidth={active ? 2.6 : 1.9} />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: active ? typography.bodySemibold : typography.body,
                  fontSize: 9,
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
