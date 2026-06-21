import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Dumbbell, Search } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { exerciseService, type Exercise } from '@/services/userServices';
import { useTheme } from '@/contexts/ThemeContext';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export default function ExerciseLibrary() {
  const { colors, radius, spacing, typography } = useTheme();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const { data, loading, error } = useAsync(() =>
    exerciseService.list(filter === 'All' ? undefined : { muscle_group: filter }),
  [filter]);

  const filtered = (data ?? []).filter((e) =>
    !query || e.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Exercise Library" showLogo />

      <Input
        placeholder="Search exercises…"
        leftIcon={<Search size={16} color={colors.mutedForeground} />}
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: spacing.md }}
      />

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        {MUSCLE_GROUPS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setFilter(g)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: filter === g ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ fontSize: 11, color: filter === g ? colors.accentForeground : colors.foreground, fontFamily: typography.bodySemibold }}>{g}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!filtered || filtered.length === 0 ? (
        <EmptyState icon={<Dumbbell size={40} color={colors.mutedForeground} />} title="No exercises found" subtitle="Try a different search or filter." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {filtered.map((e: Exercise) => (
            <Card key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{e.name}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
                  {[e.muscle_group, e.equipment, e.difficulty].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
