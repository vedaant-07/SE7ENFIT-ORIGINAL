import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Lock, Mail } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';
import { isGoogleConfigured, loginWithGoogleResponse, useGoogleAuthRequest } from '@/services/googleAuthService';

export default function UserLogin() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const { login, setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuthRequest();

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
        const session = await loginWithGoogleResponse(response, 'user');
        if (cancelled) return;
        await setSession(session.access_token, session.user);
        router.replace('/(user)');
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
  }, [response, router, setSession]);

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
      await login({ email: email.trim(), password, role: 'user' });
      router.replace('/(user)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable
          onPress={() => router.replace('/welcome')}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>

      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%', flex: 1 }}>
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Dumbbell size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>User Login</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Log in to your fitness account
          </Text>
        </View>

        <Button variant="outline" label={googleLoading ? 'Signing in with Google…' : 'Continue with Google'} onPress={handleGoogleSignIn} loading={googleLoading} disabled={!request || googleLoading} />
        <Text style={{ textAlign: 'center', fontSize: 11, color: colors.mutedForeground, marginVertical: 24, textTransform: 'uppercase' }}>
          or
        </Text>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <View style={{ gap: 16 }}>
          <Input label="Email" leftIcon={<Mail size={16} color={colors.mutedForeground} />} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" autoCapitalize="none" />
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
          <Button label={loading ? 'Logging in…' : 'Log in'} onPress={handleSubmit} loading={loading} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/user-signup')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
