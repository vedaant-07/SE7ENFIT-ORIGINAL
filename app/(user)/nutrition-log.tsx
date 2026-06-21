import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlaskConical, Plus } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { nutritionService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';

const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export default function NutritionLog() {
  const router = useRouter();
  const [food, setFood] = useState('');
  const [meal, setMeal] = useState(MEALS[0]);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!food.trim()) {
      setError('Enter a food name');
      return;
    }
    setSaving(true);
    try {
      await nutritionService.addLog({
        food_name: food.trim(),
        meal,
        calories: Number(calories) || 0,
        protein_g: Number(protein) || 0,
        date: new Date().toISOString().slice(0, 10),
      });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Log Food" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <View style={{ gap: spacing.md }}>
        <Input label="Food" placeholder="e.g. Oats with banana" value={food} onChangeText={setFood} />

        <View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Meal</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {MEALS.map((m) => (
              <Button key={m} label={m} variant={meal === m ? 'accent' : 'outline'} size="sm" fullWidth={false} onPress={() => setMeal(m)} style={{ paddingHorizontal: 12, height: 36 }} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="320" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="25" />
          </View>
        </View>

        <Button label={saving ? 'Saving…' : 'Save Entry'} onPress={submit} loading={saving} />
      </View>
    </Screen>
  );
}
