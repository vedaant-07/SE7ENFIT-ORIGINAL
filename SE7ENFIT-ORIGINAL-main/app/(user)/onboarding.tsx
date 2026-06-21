// Onboarding — collects user profile data before entering the app.
// Mirrors the web Onboarding flow: name, age, gender, height/weight, goal,
// activity level, dietary preference. Submits via userService.completeOnboarding.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Target, User } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import TopBar from '@/components/se7enfit/TopBar';

import { userService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Improve Endurance', 'Gain Weight'];
const ACTIVITY = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];
const DIETS = ['No Preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian'];
const GENDERS = ['Male', 'Female', 'Other'];

function ChipOptions<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | '';
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const active = value === o;
        return (
          <Button
            key={o}
            variant={active ? 'accent' : 'outline'}
            size="sm"
            label={o}
            fullWidth={false}
            onPress={() => onChange(o)}
            style={{ paddingHorizontal: 14, height: 38 }}
          />
        );
      })}
    </View>
  );
}

export default function Onboarding() {
  const { colors, radius, spacing, typography } = useTheme();

  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState((user as { name?: string })?.name || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'' | 'Male' | 'Female' | 'Other'>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<'' | (typeof GOALS)[number]>('');
  const [activity, setActivity] = useState<'' | (typeof ACTIVITY)[number]>('');
  const [diet, setDiet] = useState<'' | (typeof DIETS)[number]>('No Preference');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!goal || !activity) {
      setError('Please pick a goal and activity level.');
      return;
    }
    setLoading(true);
    try {
      await userService.completeOnboarding({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        goal,
        activity_level: activity,
        dietary_preference: diet,
        onboarding_complete: true,
      });
      router.replace('/(user)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <TopBar title="Set Up Your Profile" showLogo />

      <View style={{ gap: spacing.md }}>
        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Your Name</Text>
          <Input leftIcon={<User size={16} color={colors.mutedForeground} />} placeholder="e.g. Arjun" value={name} onChangeText={setName} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Age</Text>
            <Input placeholder="26" value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Height (cm)</Text>
            <Input placeholder="175" value={height} onChangeText={setHeight} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Weight (kg)</Text>
            <Input placeholder="72" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
        </View>

        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Gender</Text>
          <ChipOptions options={GENDERS} value={gender} onChange={(v) => setGender(v as typeof gender)} />
        </View>

        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Primary Goal</Text>
          <ChipOptions options={GOALS} value={goal} onChange={setGoal} />
        </View>

        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Activity Level</Text>
          <ChipOptions options={ACTIVITY} value={activity} onChange={setActivity} />
        </View>

        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Dietary Preference</Text>
          <ChipOptions options={DIETS} value={diet} onChange={setDiet} />
        </View>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <Button label={loading ? 'Saving…' : 'Continue'} onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}
