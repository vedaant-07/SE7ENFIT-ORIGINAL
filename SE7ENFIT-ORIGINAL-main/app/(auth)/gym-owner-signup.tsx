import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, Lock, Mail, Phone, User } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import Logo from '@/components/se7enfit/Logo';

import { useAuth } from '@/contexts/AuthContext';
import { gymOwnerService } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

export default function GymOwnerSignup() {
  const { colors, typography } = useTheme();

  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ ownerName: '', email: '', mobile: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError('');
    const ownerName = form.ownerName.trim();
    const email = form.email.trim();
    const mobile = form.mobile.trim();
    if (!ownerName) {
      setError('Please enter owner name');
      return;
    }
    if (!email) {
      setError('Please enter email');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password: form.password, name: ownerName, mobile, role: 'gym_owner' });
      try {
        await gymOwnerService.upsert({
          owner_name: ownerName,
          email,
          mobile,
          gym_name: '',
          onboarding_complete: false,
        });
      } catch {
        /* backend may auto-create on register */
      }
      router.replace('/(gym-owner)/onboarding');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
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