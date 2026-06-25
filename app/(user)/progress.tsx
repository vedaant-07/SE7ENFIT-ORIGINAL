// Progress — fitness score and weekly trends.
import { Text, View } from 'react-native';
import { TrendingUp, Flame, Dumbbell, Trophy } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import StatCard from '@/components/se7enfit/StatCard';
import ProgressRing from '@/components/se7enfit/ProgressRing';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { progressService } from '@/services/userServices';
import { useTheme } from '@/contexts/ThemeContext';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_DATA = [60, 75, 45, 90, 80, 0, 0];

export default function Progress() {
  const { colors, spacing, typography } = useTheme();

  const { data, loading, error } = useAsync(() => progressService.getSummary());

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Progress" showLogo />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {/* Fitness score hero */}
      <Card elevated style={{ alignItems: 'center', marginBottom: spacing.lg, paddingVertical: spacing.xl }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.mutedForeground, marginBottom: spacing.sm }}>Fitness Score</Text>
        <ProgressRing size={120} strokeWidth={10} progress={0.72} value="72" />
        <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent, marginTop: spacing.sm }}>+4 this week</Text>
      </Card>

      {/* Stat row */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatCard icon={<Flame size={16} color={colors.accent} />} label="Streak" value="12 days" caption="Best: 21" />
        <StatCard icon={<Dumbbell size={16} color="#38BDF8" />} label="Workouts" value="8" color="#38BDF8" caption="This week" />
        <StatCard icon={<TrendingUp size={16} color="#F5A623" />} label="Goal" value="68%" color="#F5A623" caption="On track" />
      </View>

      {/* Weekly activity bar chart */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.md }}>This Week</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
          {WEEK_DATA.map((val, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={{ width: 16, height: val, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: val > 0 ? colors.accent : colors.secondary }} />
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: typography.body }}>{WEEK_DAYS[i]}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Achievements */}
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Recent Achievements</Text>
      <View style={{ gap: spacing.sm }}>
        {[
          { icon: Trophy, label: '7-Day Streak', desc: 'Completed workouts 7 days in a row' },
          { icon: Flame, label: '100 Workouts', desc: 'Total workouts completed' },
          { icon: TrendingUp, label: 'New PR', desc: 'Bench press: 80 kg × 5' },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{a.label}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{a.desc}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
