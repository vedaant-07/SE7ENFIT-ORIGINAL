// Forgot password placeholder — wires to a single endpoint on the Render
// backend. Web calls base44.auth.forgotPassword/resetPassword; here we use
// the API service so once your endpoint exists the screen just works.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import OTPInput from '@/components/se7enfit/OTPInput';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';

import { api, ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

type Step = 'request' | 'reset';

export default function ForgotPassword() {
  const { colors, typography } = useTheme();

  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() }, false);
      setStep('reset');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp_code: otp, new_password: password }, false);
      router.replace('/(auth)/user-login');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>
      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%' }}>
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Mail size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>
            {step === 'request' ? 'Reset Password' : 'Set New Password'}
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            {step === 'request' ? 'Enter your email to receive a code' : `Enter the code sent to ${email} and a new password`}
          </Text>
        </View>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        {step === 'request' ? (
          <View style={{ gap: 16 }}>
            <Input label="Email" leftIcon={<Mail size={16} color={colors.mutedForeground} />} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Button label={loading ? 'Sending…' : 'Send Code'} onPress={handleRequest} loading={loading} />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <OTPInput value={otp} onChange={setOtp} />
            </View>
            <Input label="New Password" leftIcon={<Lock size={16} color={colors.mutedForeground} />} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            <Button label={loading ? 'Resetting…' : 'Reset Password'} onPress={handleReset} loading={loading} disabled={otp.length < 6 || !password} />
          </View>
        )}
      </View>
    </Screen>
  );
}
