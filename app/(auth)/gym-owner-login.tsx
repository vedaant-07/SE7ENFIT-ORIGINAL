import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, Lock, Mail, Zap } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/apiClient';
import { authService } from '@/services/authService';

// Demo gym owner session — for testing without backend
const DEMO_OWNER_USER = {
  id: 'demo-owner-001',
  email: 'demo.owner@se7enfit.com',
  name: 'Demo Gym',
  role: 'gym_owner' as const,
};
const DEMO_OWNER_TOKEN = 'demo_owner_token_se7enfit_preview';

export default function GymOwnerLogin() {
  const router = useRouter();
  const { login, setSession } = useAuth();
  const { colors, spacing, typography, radius } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Pass role so backend enforces gym owner access
      const session = await authService.login({ email: email.trim(), password, role: 'OWNER' });
      if (!session?.access_token) {
        throw new ApiError('Login failed — no token returned.', 500);
      }
      await setSession(session.access_token, session.user);

      // Check user role and redirect
      const role = String(session.user?.role || '').toLowerCase();
      if (role === 'gym_owner' || role === 'owner') {
        router.replace('/(gym-owner)/dashboard');
      } else {
        setError('This account does not have gym owner access.');
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setSession(DEMO_OWNER_TOKEN, DEMO_OWNER_USER);
      router.replace('/(gym-owner)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(41, 224, 107, 0.05)' }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable
          onPress={() => router.replace('/welcome')}
          hitSlop={12}
          style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>

      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%' }}>
        <View style={{ marginBottom: 28 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Building2 size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>
            Gym Owner Login
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Access your gym dashboard
          </Text>
        </View>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <View style={{ gap: 16 }}>
          <Input
            label="Email"
            leftIcon={<Mail size={16} color={colors.mutedForeground} />}
            placeholder="gym@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            leftIcon={<Lock size={16} color={colors.mutedForeground} />}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            hint={
              <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
                <Text style={{ fontSize: 12, color: colors.accent }}>Forgot?</Text>
              </Pressable>
            }
          />
          <Button
            label={loading ? 'Logging in…' : 'Login to Dashboard'}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>

        {/* Demo Login */}
        <Pressable
          onPress={handleDemoLogin}
          style={({ pressed }) => ({
            marginTop: 16,
            height: 48, borderRadius: radius.sm,
            borderWidth: 1, borderColor: colors.warning + '40',
            backgroundColor: colors.warning + '10',
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Zap size={16} color={colors.warning} />
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.warning }}>
            Try Demo Owner Mode
          </Text>
        </Pressable>
        <Text style={{ fontSize: 10, color: colors.mutedForeground, textAlign: 'center', marginTop: 6 }}>
          Demo mode loads the dashboard without a real account
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>New gym owner?</Text>
          <Pressable onPress={() => router.push('/(auth)/gym-owner-signup')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>
              Register your gym
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
