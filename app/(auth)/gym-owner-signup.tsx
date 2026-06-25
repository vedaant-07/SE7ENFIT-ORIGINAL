import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, Lock, Mail, Phone, User } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import OTPInput from '@/components/se7enfit/OTPInput';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';

import { useAuth } from '@/contexts/AuthContext';
import { gymOwnerService } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

export default function GymOwnerSignup() {
  const { colors, typography } = useTheme();

  const router = useRouter();
  const { register, verifyOtp } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ ownerName: '', email: '', mobile: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ email: form.email.trim(), password: form.password, name: form.ownerName, mobile: form.mobile, role: 'gym_owner' });
      setStep(2);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp(form.email.trim(), otp);
      // After auth: create the gym owner record (incomplete until onboarding).
      try {
        await gymOwnerService.upsert({
          owner_name: form.ownerName,
          email: form.email.trim(),
          mobile: form.mobile,
          gym_name: '',
          onboarding_complete: false,
        });
      } catch {
        /* backend may auto-create on register */
      }
      router.replace('/(gym-owner)/onboarding');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <Screen scroll>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
          <Pressable onPress={() => setStep(1)} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
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
              Code sent to {form.email}
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
                authService.resendOtp(form.email.trim()).catch(() => {});
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
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(41, 224, 107, 0.05)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 32 }}>
        <Pressable onPress={() => router.replace('/welcome')} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>
      <View style={{ maxWidth: 360, alignSelf: 'center', width: '100%', paddingBottom: 40 }}>
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Building2 size={26} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 24, color: colors.foreground }}>Register Your Gym</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
            Create your gym owner account
          </Text>
        </View>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <View style={{ gap: 16 }}>
          <Input label="Owner Name" leftIcon={<User size={16} color={colors.mutedForeground} />} placeholder="Your full name" value={form.ownerName} onChangeText={set('ownerName')} />
          <Input label="Mobile Number" leftIcon={<Phone size={16} color={colors.mutedForeground} />} placeholder="+91 9876543210" value={form.mobile} onChangeText={set('mobile')} keyboardType="phone-pad" />
          <Input label="Email" leftIcon={<Mail size={16} color={colors.mutedForeground} />} placeholder="gym@example.com" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" leftIcon={<Lock size={16} color={colors.mutedForeground} />} placeholder="••••••••" value={form.password} onChangeText={set('password')} secureTextEntry />
          <Input label="Confirm Password" leftIcon={<Lock size={16} color={colors.mutedForeground} />} placeholder="••••••••" value={form.confirm} onChangeText={set('confirm')} secureTextEntry />
          <Button label={loading ? 'Creating account…' : 'Create Gym Account'} onPress={handleRegister} loading={loading} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Already have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/gym-owner-login')} hitSlop={8}>
            <Text style={{ fontSize: 14, color: colors.accent, fontFamily: typography.bodySemibold }}>Login</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
