// Log a completed workout — exercises, duration, calories.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Plus, Timer, Trash2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { workoutService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';

type LoggedExercise = { name: string; sets: string; reps: string };

export default function WorkoutLog() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [exercises, setExercises] = useState<LoggedExercise[]>([{ name: '', sets: '', reps: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateExercise = (i: number, k: keyof LoggedExercise, v: string) =>
    setExercises((arr) => arr.map((e, idx) => (idx === i ? { ...e, [k]: v } : e)));

  const submit = async () => {
    setError('');
    if (!duration) {
      setError('Enter a duration');
      return;
    }
    setSaving(true);
    try {
      await workoutService.logWorkout({
        date,
        duration_min: Number(duration),
        calories_burned: calories ? Number(calories) : undefined,
        exercises: exercises.filter((e) => e.name),
        completed: true,
      });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Log Workout" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Duration (min)" leftIcon={<Timer size={16} color={colors.mutedForeground} />} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="45" />
        </View>
      </View>

      <Input
        label="Calories burned (optional)"
        leftIcon={<Flame size={16} color={colors.mutedForeground} />}
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        placeholder="320"
        style={{ marginBottom: spacing.md }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>Exercises</Text>
        <Button label="Add" variant="outline" size="sm" fullWidth={false} onPress={() => setExercises((a) => [...a, { name: '', sets: '', reps: '' }])} style={{ paddingHorizontal: 12, height: 34 }} />
      </View>

      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        {exercises.map((e, i) => (
          <Card key={i}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
              <Input placeholder="Exercise name" value={e.name} onChangeText={(v) => updateExercise(i, 'name', v)} style={{ flex: 1 }} />
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setExercises((arr) => arr.filter((_, idx) => idx !== i))}
                style={{ width: 36, height: 36, paddingHorizontal: 0 }}
              >
                <Trash2 size={16} color={colors.error} />
              </Button>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Input placeholder="Sets" value={e.sets} onChangeText={(v) => updateExercise(i, 'sets', v)} keyboardType="numeric" style={{ flex: 1 }} />
              <Input placeholder="Reps" value={e.reps} onChangeText={(v) => updateExercise(i, 'reps', v)} keyboardType="numeric" style={{ flex: 1 }} />
            </View>
          </Card>
        ))}
      </View>

      <Button label={saving ? 'Saving…' : 'Save Workout'} onPress={submit} loading={saving} />
    </Screen>
  );
}
