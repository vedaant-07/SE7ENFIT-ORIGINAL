import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Flame, Plus, Utensils } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import ProgressRing from '@/components/se7enfit/ProgressRing';
import { colors, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { nutritionService, type NutritionLog } from '@/services/userServices';

function kcal(val: unknown): number {
  return typeof val === 'number' ? val : 0;
}

export default function Nutrition() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, loading, error } = useAsync(() => nutritionService.listLogs(date), [date]);

  if (loading) return <LoadingScreen />;

  const logs = data ?? [];
  const totalCalories = logs.reduce((s, l) => s + kcal(l.calories), 0);
  const totalProtein = logs.reduce((s, l) => s + kcal(l.protein_g), 0);
  const goal = 2200;
  const proteinGoal = 140;

  return (
    <Screen>
      <TopBar title="Nutrition" showLogo />

      <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={{ marginBottom: spacing.md }} />

      {/* Today's rings */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.md }}>Today</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <ProgressRing size={72} progress={totalCalories / goal} value={`${totalCalories}`} label="Calories" />
          <ProgressRing size={72} progress={totalProtein / proteinGoal} value={`${totalProtein}g`} label="Protein" color="#38BDF8" />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Button label="Log Food" onPress={() => router.push('/(user)/nutrition-log')} />
        <Button label="Scan Food" variant="outline" onPress={() => router.push('/(user)/food-scan')} />
      </View>

      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Today's Meals</Text>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {logs.length === 0 ? (
        <EmptyState icon={<Utensils size={40} color={colors.mutedForeground} />} title="No food logged" subtitle="Tap 'Log Food' to add a meal." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {logs.map((l: NutritionLog) => (
            <Card key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{l.food_name}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
                  {l.meal} · {l.calories} kcal · {l.protein_g}g protein
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
