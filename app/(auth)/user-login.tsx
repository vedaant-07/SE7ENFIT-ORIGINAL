import { useState, useEffect } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Lock, Mail } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/apiClient';
import {
  useGoogleAuthRequest,
  loginWithGoogleToken,
  isGoogleConfigured,
} from '@/services/googleAuthService';

export default function UserLogin() {
  const router = useRouter();
  const { login, setSession } = useAuth();
  const { colors, spacing, typography, radius } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google OAuth hook — must be at top level
  const [request, response, promptAsync] = useGoogleAuthRequest();

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (!token) {
        setError('Google sign-in failed. No token received.');
        return;
      }

      setGoogleLoading(true);
      setError('');

      (async () => {
        try {
          const session = await loginWithGoogleToken(token);
          if (!session?.access_token) {
            throw new ApiError('No token returned from server.', 500);
          }
          await setSession(session.access_token, session.user);
          router.replace('/(user)');
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : 'Google sign-in failed.';
          setError(msg);
        } finally {
          setGoogleLoading(false);
        }
      })();
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      setError(
        'Google sign-in is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      );
      return;
    }
    setError('');
    await promptAsync();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(user)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      {/* Ambient glow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 256, height: 256, borderRadius: 128,
          backgroundColor: 'rgba(41, 224, 107, 0.05)',
        }}
      />

      {/* Back + logo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable
          onPress={() => router.replace('/welcome')}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 12, borderWidth: 1,
            borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>

      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%', flex: 1 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: colors.accentSoft, borderWidth: 1,
            borderColor: colors.accentBorder, alignItems: 'center',
            justifyContent: 'center', marginBottom: 16,
          }}>
            <Dumbbell size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>
            User Login
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Log in to your fitness account
          </Text>
        </View>

        {/* Google Sign-In */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={googleLoading || !request}
          style={({ pressed }) => ({
            height: 52,
            borderRadius: radius.sm,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.card,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: pressed || googleLoading ? 0.7 : 1,
          })}
        >
          {/* Google G icon */}
          <View style={{ width: 20, height: 20 }}>
            <Text style={{ fontSize: 16, fontFamily: typography.bodyBold }}>G</Text>
          </View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 15, color: colors.foreground }}>
            {googleLoading ? 'Signing in with Google…' : 'Continue with Google'}
          </Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ fontSize: 11, color: colors.mutedForeground, textTransform: 'uppercase' }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <View style={{ gap: 16 }}>
          <Input
            label="Email"
            leftIcon={<Mail size={16} color={colors.mutedForeground} />}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
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
            label={loading ? 'Logging in…' : 'Log in'}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/user-signup')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
