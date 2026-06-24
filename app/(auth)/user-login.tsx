import { useState, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Lock, Mail, Zap } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/apiClient';
import {
  useGoogleAuthRequest,
  extractGoogleIdToken,
  isGoogleConfigured,
} from '@/services/googleAuthService';

// Demo user — for testing when backend is not yet connected
const DEMO_USER = {
  id: 'demo-001',
  email: 'demo@se7enfit.com',
  name: 'Demo Athlete',
  role: 'user' as const,
};
const DEMO_TOKEN = 'demo_token_se7enfit_preview';

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
    if (!response) return;

    if (response.type === 'success') {
      const idToken = extractGoogleIdToken(response);
      if (!idToken) {
        setError('Google sign-in returned no token. Please try again.');
        return;
      }

      setGoogleLoading(true);
      setError('');

      (async () => {
        try {
          const session = await authService.loginWithGoogle(idToken, 'user');
          if (!session?.access_token) {
            throw new ApiError('No token returned from server.', 500);
          }
          await setSession(session.access_token, session.user);
          router.replace('/(user)');
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : 'Google sign-in failed. Please try again.';
          setError(msg);
        } finally {
          setGoogleLoading(false);
        }
      })();
    } else if (response.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
    }
    // response.type === 'dismiss' or 'cancel' — do nothing
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      setError(
        'Google sign-in requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env. See README for setup.'
      );
      return;
    }
    setError('');
    await promptAsync();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(user)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setSession(DEMO_TOKEN, DEMO_USER);
      router.replace('/(user)');
    } finally {
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
        <View style={{ marginBottom: 28 }}>
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
          disabled={googleLoading}
          style={({ pressed }) => ({
            height: 52, borderRadius: radius.sm,
            borderWidth: 1.5, borderColor: colors.border,
            backgroundColor: colors.card,
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 12,
            opacity: pressed || googleLoading ? 0.7 : 1,
          })}
        >
          {/* Google G SVG-style badge */}
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: '#fff', alignItems: 'center',
            justifyContent: 'center', borderWidth: 0.5, borderColor: '#ddd',
          }}>
            <Text style={{ fontSize: 13, fontFamily: typography.bodyBold, color: '#4285F4' }}>G</Text>
          </View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 15, color: colors.foreground }}>
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </Pressable>

        {/* Divider */}
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
            Try Demo Mode
          </Text>
        </Pressable>
        <Text style={{ fontSize: 10, color: colors.mutedForeground, textAlign: 'center', marginTop: 6 }}>
          Demo mode loads the app without a real account
        </Text>

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
