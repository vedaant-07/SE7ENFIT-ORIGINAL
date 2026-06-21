// Gym owner onboarding — collect gym name, address, city, logo before dashboard.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, MapPin, Phone } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import TopBar from '@/components/se7enfit/TopBar';
import { colors, spacing, typography } from '@/constants/theme';
import { gymOwnerService } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';

export default function GymOwnerOnboarding() {
  const router = useRouter();
  const [gymName, setGymName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!gymName.trim()) {
      setError('Please enter your gym name.');
      return;
    }
    setLoading(true);
    try {
      await gymOwnerService.completeOnboarding({
        gym_name: gymName.trim(),
        gym_address: address.trim(),
        gym_city: city.trim(),
        mobile,
        onboarding_complete: true,
      });
      router.replace('/(gym-owner)/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <TopBar title="Gym Setup" showLogo />
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.headingBold, fontSize: 22, color: colors.foreground }}>Tell us about your gym</Text>
        <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, marginTop: 6 }}>
          This info shows to members and on your gym profile.
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <Input label="Gym Name" leftIcon={<Building2 size={16} color={colors.mutedForeground} />} placeholder="e.g. Iron Forge Fitness" value={gymName} onChangeText={setGymName} />
        <Input label="Address" leftIcon={<MapPin size={16} color={colors.mutedForeground} />} placeholder="Street, area" value={address} onChangeText={setAddress} />
        <Input label="City" placeholder="Mumbai" value={city} onChangeText={setCity} />
        <Input label="Contact Number" leftIcon={<Phone size={16} color={colors.mutedForeground} />} placeholder="+91 9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <Button label={loading ? 'Saving…' : 'Complete Setup'} onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}
