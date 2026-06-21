import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight, Dumbbell, Loader2, Zap } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Logo from '@/components/se7enfit/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Welcome() {
  const router = useRouter();
  const { user, token, isLoadingAuth } = useAuth();
  const { colors, radius, spacing, typography } = useTheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;

    // If authenticated, redirect based on role
    if (token && user) {
      const role = user.role;
      if (role === 'gym_owner') {
        router.replace('/(gym-owner)/dashboard');
      } else {
        // Default to user app for 'user' role or no role
        router.replace('/(user)');
      }
      return;
    }

    // Not authenticated, show welcome screen
    setChecking(false);
  }, [isLoadingAuth, token, user, router]);

  if (checking || isLoadingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Logo size={28} />
          <Loader2 size={28} color={colors.accent} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  return (
    <Screen scroll={false} paddingHorizontal={spacing.lg} style={{ flex: 1 }}>
      {/* Ambient green glow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          marginLeft: -192,
          width: 384,
          height: 384,
          borderRadius: 192,
          backgroundColor: 'rgba(41, 224, 107, 0.08)',
          opacity: 1,
        }}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 360, alignSelf: 'center' }}>
        {/* Logo block */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.accentBorder,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Zap size={36} color={colors.accent} />
          </View>
          <Logo size={42} />
          <Text style={{ fontFamily: typography.bodyMedium, fontSize: 14, color: colors.mutedForeground, marginTop: 8 }}>
            India's #1 AI Fitness App
          </Text>
        </View>

        {/* Tagline */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground, textAlign: 'center' }}>
            Transform Your <Text style={{ color: colors.accent }}>Body & Mind</Text>
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            AI-powered workouts, nutrition tracking,{'\n'}challenges & rewards — all in one app.
          </Text>
        </View>

        {/* CTA buttons */}
        <View style={{ gap: 16, width: '100%', marginBottom: 24 }}>
          {/* User */}
          <Pressable
            onPress={() => router.push('/(auth)/user-login')}
            style={({ pressed }) => ({
              height: 64,
              borderRadius: radius.md,
              backgroundColor: colors.accent,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              gap: 16,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Dumbbell size={22} color={colors.accentForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.accentForeground }}>
                Continue as User
              </Text>
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accentForeground, opacity: 0.75 }}>
                Track fitness, nutrition & more
              </Text>
            </View>
            <ChevronRight size={20} color={colors.accentForeground} />
          </Pressable>

          {/* Gym owner */}
          <Pressable
            onPress={() => router.push('/(auth)/gym-owner-login')}
            style={({ pressed }) => ({
              minHeight: 64,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              borderWidth: 2,
              borderColor: colors.accentBorder,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              gap: 16,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1, paddingVertical: 12 }}>
              <Text style={{ fontFamily: typography.headingBold, fontSize: 16, color: colors.foreground }}>
                Continue as Gym Owner
              </Text>
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                Manage members, leads & earnings
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Legal */}
        <Text style={{ textAlign: 'center', fontSize: 10, color: colors.mutedForeground, lineHeight: 14, paddingHorizontal: 16 }}>
          By continuing, you agree to our{' '}
          <Text onPress={() => router.push('/(auth)/policy')} style={{ textDecorationLine: 'underline' }}>
            Terms
          </Text>{' '}
          and{' '}
          <Text onPress={() => router.push('/(auth)/policy')} style={{ textDecorationLine: 'underline' }}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </Screen>
  );
}
