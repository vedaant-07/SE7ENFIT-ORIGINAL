import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Mail, Building2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/src/api/client';
import { useTheme } from '@/contexts/ThemeContext';
import { gymOwnerService } from '@/services/gymOwnerServices';
import { useGoogleLogin } from '@/src/services/googleAuthService';

export default function GymOwnerLogin() {
  const { colors, spacing, typography } = useTheme();

  const router = useRouter();
  const { login, setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleLogin('gym_owner');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password, role: 'gym_owner' });
      // Decide whether this account has a gym owner profile yet.
      try {
        const owner = await gymOwnerService.getMine();
        router.replace(owner.onboarding_complete ? '/(gym-owner)/dashboard' : '/(gym-owner)/onboarding');
        return;
      } catch {
        // No owner profile — go to signup.
        router.replace('/(auth)/gym-owner-signup');
        return;
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      await setSession(session.access_token, session.user);
      
      // Decide whether this account has a gym owner profile yet.
      try {
        const owner = await gymOwnerService.getMine();
        router.replace(owner.onboarding_complete ? '/(gym-owner)/dashboard' : '/(gym-owner)/onboarding');
        return;
      } catch {
        // No owner profile — go to signup.
        router.replace('/(auth)/gym-owner-signup');
        return;
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      {/* Ambient glow */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(41, 224, 107, 0.05)' }} />

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
            <Building2 size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>Gym Owner Login</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Access your gym dashboard
          </Text>
        </View>

        <Button 
          variant="outline" 
          label="Continue with Google" 
          onPress={handleGoogleLogin} 
          loading={googleLoading} 
        />
        <Text style={{ textAlign: 'center', fontSize: 11, color: colors.mutedForeground, marginVertical: 24, textTransform: 'uppercase' }}>
          or
        </Text>

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
