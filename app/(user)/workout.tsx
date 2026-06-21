import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, ChevronRight, Dumbbell, Plus, Sparkles, Timer } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { workoutService, type WorkoutLog } from '@/services/userServices';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

const QUICK_PLANS = [
  { name: 'Push Day', duration: '45 min', icon: Dumbbell, color: '#F5A623' },
  { name: 'Pull Day', duration: '50 min', icon: Dumbbell, color: '#38BDF8' },
  { name: 'Leg Day', duration: '55 min', icon: Dumbbell, color: '#A78BFA' },
  { name: 'Full Body', duration: '40 min', icon: Dumbbell, color: colors.accent },
];

export default function Workout() {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(() => workoutService.listLogs());
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      await workoutService.generate({ goal: 'general_fitness', duration_min: 45 });
      reload();
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Workout" showLogo />

      {/* AI generate hero */}
      <Card elevated style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>AI Workout Generator</Text>
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>Get a personalized plan in seconds</Text>
          </View>
        </View>
        <Button label={generating ? 'Generating…' : 'Generate Plan'} onPress={generate} loading={generating} />
      </Card>

      {/* Quick plans */}
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.md }}>Quick Workouts</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, marginBottom: spacing.lg }}>
        {QUICK_PLANS.map((p) => {
          const Icon = p.icon;
          return (
            <Pressable key={p.name} onPress={() => router.push('/(user)/workout-guide')} style={({ pressed }) => ({ width: '50%', padding: 3, opacity: pressed ? 0.9 : 1 })}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${p.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{p.name}</Text>
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{p.duration}</Text>
                </View>
                <ChevronRight size={16} color={colors.mutedForeground} />
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Recent logs */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>Recent Workouts</Text>
        <Pressable onPress={() => router.push('/(user)/workout-log')} hitSlop={8}>
          <Text style={{ fontSize: 12, color: colors.accent }}>Log Workout</Text>
        </Pressable>
      </View>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Dumbbell size={40} color={colors.mutedForeground} />} title="No workouts logged" subtitle="Tap 'Log Workout' to record one." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((w: WorkoutLog) => (
            <Card key={w.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Timer size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>
                  {w.duration_min ? `${w.duration_min} min` : 'Workout'} · {formatDate(w.date)}
                </Text>
                {w.calories_burned ? (
                  <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>{w.calories_burned} kcal burned</Text>
                ) : null}
              </View>
              {w.completed ? (
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${colors.accent}20` }}>
                  <Text style={{ fontSize: 10, color: colors.accent, fontFamily: typography.bodySemibold }}>DONE</Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
