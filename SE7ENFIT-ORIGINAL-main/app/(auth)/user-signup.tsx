import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Dumbbell, Hash, Lock, Mail, Building2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import OTPInput from '@/components/se7enfit/OTPInput';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';

import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

export default function UserSignup() {
  const { colors, spacing, typography } = useTheme();

  const router = useRouter();
  const { register, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [gymCode, setGymCode] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gymInfo, setGymInfo] = useState<{ valid: boolean } | null>(null);
  const [gymCodeError, setGymCodeError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ email: email.trim(), password, role: 'user' });
      setShowOtp(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const validateGymCode = async (code: string) => {
    if (!code.trim()) {
      setGymInfo(null);
      setGymCodeError('');
      return;
    }
    try {
      const result = await userService.validateGymCode(code.trim());
      setGymInfo(result);
      setGymCodeError(result.valid ? '' : 'Invalid gym referral code. Please check with your gym owner.');
    } catch {
      setGymInfo(null);
      setGymCodeError('Invalid gym referral code. Please check with your gym owner.');
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email.trim(), otp);
      router.replace('/(user)/onboarding');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <Screen scroll>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
          <Pressable onPress={() => setShowOtp(false)} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={18} color={colors.foreground} />
          </Pressable>
          <Logo size={20} />
        </View>
        <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%' }}>
          <View style={{ marginBottom: 32 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Mail size={26} color={colors.accent} />
            </View>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>Verify Email</Text>
            <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
              Code sent to {email}
            </Text>
          </View>
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <OTPInput value={otp} onChange={setOtp} />
          </View>
          <Button label={loading ? 'Verifying…' : 'Verify & Continue'} onPress={handleVerify} loading={loading} disabled={otp.length < 6} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Didn't get code?</Text>
            <Pressable
              onPress={async () => {
                const { authService } = await import('@/services/authService');
                authService.resendOtp(email.trim()).catch(() => {});
              }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>Resend</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(41, 224, 107, 0.05)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable onPress={() => router.replace('/welcome')} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>
      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%', paddingBottom: 40 }}>
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Dumbbell size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>Create User Account</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Start your fitness journey today
          </Text>
        </View>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <View style={{ gap: 16 }}>
          <Input label="Email" leftIcon={<Mail size={16} color={colors.mutedForeground} />} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" leftIcon={<Lock size={16} color={colors.mutedForeground} />} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm Password" leftIcon={<Lock size={16} color={colors.mutedForeground} />} placeholder="••••••••" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <Input
            label="Gym Referral Code (optional)"
            leftIcon={<Hash size={16} color={colors.mutedForeground} />}
            placeholder="Enter gym code"
            value={gymCode}
            onChangeText={(v) => {
              setGymCode(v);
              validateGymCode(v);
            }}
            errorText={gymCodeError || undefined}
          />
          {gymInfo?.valid && gymCode ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Building2 size={14} color={colors.accent} />
              <Text style={{ fontSize: 12, color: colors.accent, fontFamily: typography.bodyMedium }}>Valid code — your gym will be linked</Text>
            </View>
          ) : null}
          <Button label={loading ? 'Creating account…' : 'Create Account'} onPress={handleSubmit} loading={loading} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Already have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/user-login')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>Login</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
