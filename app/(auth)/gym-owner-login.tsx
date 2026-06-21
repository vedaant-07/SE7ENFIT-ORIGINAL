import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, Lock, Mail } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { gymOwnerService } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';
import { isGoogleConfigured, loginWithGoogleResponse, useGoogleAuthRequest } from '@/services/googleAuthService';

export default function GymOwnerLogin() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const { login, setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuthRequest();

  const routeAfterOwnerAuth = async () => {
    try {
      const owner = await gymOwnerService.getMine();
      router.replace(owner.onboarding_complete ? '/(gym-owner)/dashboard' : '/(gym-owner)/onboarding');
    } catch {
      router.replace('/(auth)/gym-owner-signup');
    }
  };

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error') setError('Google sign-in was cancelled or failed.');
      return;
    }

    let cancelled = false;
    setGoogleLoading(true);
    setError('');

    (async () => {
      try {
        const session = await loginWithGoogleResponse(response, 'gym_owner');
        if (cancelled) return;
        await setSession(session.access_token, session.user);
        await routeAfterOwnerAuth();
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof ApiError || e instanceof Error ? e.message : 'Google sign-in failed.';
        setError(msg);
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response, setSession]);

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      setError('Google sign-in is not configured. Add Google OAuth client IDs and rebuild the APK.');
      return;
    }
    setError('');
    await promptAsync();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password, role: 'gym_owner' });
      await routeAfterOwnerAuth();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable onPress={() => router.replace('/welcome')} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>

      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%' }}>
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Building2 size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>Gym Owner Login</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Access your gym dashboard
          </Text>
        </View>

        <Button variant="outline" label={googleLoading ? 'Signing in with Google…' : 'Continue with Google'} onPress={handleGoogleSignIn} loading={googleLoading} disabled={!request || googleLoading} />
        <Text style={{ textAlign: 'center', fontSize: 11, color: colors.mutedForeground, marginVertical: 24, textTransform: 'uppercase' }}>
          or
        </Text>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <View style={{ gap: 16 }}>
          <Input label="Email" leftIcon={<Mail size={16} color={colors.mutedForeground} />} placeholder="gym@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
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
          <Button label={loading ? 'Logging in…' : 'Login to Dashboard'} onPress={handleSubmit} loading={loading} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>New gym owner?</Text>
          <Pressable onPress={() => router.push('/(auth)/gym-owner-signup')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>Register your gym</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
