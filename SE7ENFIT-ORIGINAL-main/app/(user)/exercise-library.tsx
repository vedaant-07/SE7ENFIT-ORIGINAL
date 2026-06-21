import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Dumbbell, Play, Search, Target, Video } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import { useAsync } from '@/hooks/useAsync';
import { exerciseService, type Exercise } from '@/services/userServices';
import { useTheme } from '@/contexts/ThemeContext';
import { EXERCISE_VIDEO_GUIDES, type ExerciseVideoGuide } from '@/src/data/exerciseVideoGuides';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

type LibraryItem = ExerciseVideoGuide & { backendExercise?: Exercise };

function toLibraryItems(data?: Exercise[]): LibraryItem[] {
  const backend = data ?? [];
  if (!backend.length) return EXERCISE_VIDEO_GUIDES;
  return backend.map((exercise) => {
    const guide = EXERCISE_VIDEO_GUIDES.find((item) => item.name.toLowerCase() === exercise.name.toLowerCase()) ?? EXERCISE_VIDEO_GUIDES[0];
    return {
      ...guide,
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscle_group || guide.muscleGroup,
      equipment: exercise.equipment || guide.equipment,
      difficulty: (exercise.difficulty as LibraryItem['difficulty']) || guide.difficulty,
      thumbnailUrl: exercise.image_url || guide.thumbnailUrl,
      backendExercise: exercise,
    };
  });
}

export default function ExerciseLibrary() {
  const { colors, radius, spacing, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const { data, error } = useAsync(() => exerciseService.list(filter === 'All' ? undefined : { muscle_group: filter }), [filter]);

  const items = toLibraryItems(data);
  const filtered = items.filter((e) => (!query || e.name.toLowerCase().includes(query.toLowerCase())) && (filter === 'All' || e.muscleGroup.toLowerCase() === filter.toLowerCase()));

  return (
    <Screen>
      <TopBar title="Exercise Library" showLogo />
      <Input placeholder="Search exercises…" leftIcon={<Search size={16} color={colors.mutedForeground} />} value={query} onChangeText={setQuery} style={{ marginBottom: spacing.md }} />

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        {MUSCLE_GROUPS.map((g) => (
          <Pressable key={g} onPress={() => setFilter(g)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: filter === g ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 11, color: filter === g ? colors.accentForeground : colors.foreground, fontFamily: typography.bodySemibold }}>{g}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={{ color: colors.mutedForeground, fontFamily: typography.body, fontSize: 12, marginBottom: spacing.sm }}>Showing built-in exercise guides while backend syncs.</Text> : null}

      <View style={{ gap: spacing.md }}>
        {filtered.map((item: LibraryItem) => (
          <Card key={item.id} style={{ overflow: 'hidden', padding: 0 }}>
            <View style={{ height: 260, backgroundColor: colors.secondary, padding: spacing.md, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder }}>
                  <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold, fontSize: 11 }}>VIDEO GUIDE</Text>
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: typography.body, fontSize: 11 }}>{item.difficulty}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: item.videoUrl ? colors.accent : colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                  {item.videoUrl ? <Play size={30} color={colors.accentForeground} fill={colors.accentForeground} /> : <Video size={28} color={colors.mutedForeground} />}
                </View>
                <Text style={{ fontFamily: typography.headingBold, color: colors.foreground, fontSize: 20, textAlign: 'center' }}>{item.name}</Text>
                <Text style={{ fontFamily: typography.body, color: colors.mutedForeground, fontSize: 12, textAlign: 'center', marginTop: 5 }}>{item.videoUrl ? 'CDN video preview ready' : 'Video URL slot ready for admin upload'}</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Target size={14} color={colors.accent} />
                  <Text style={{ color: colors.foreground, fontFamily: typography.bodySemibold, fontSize: 12 }}>{item.targetMuscles.join(' · ')}</Text>
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: typography.body, fontSize: 12 }}>{item.muscleGroup} · {item.equipment} · {item.sets}×{item.reps}</Text>
              </View>
            </View>
            <View style={{ padding: spacing.md, gap: spacing.sm }}>
              <Text style={{ color: colors.foreground, fontFamily: typography.bodySemibold, fontSize: 13 }}>Tips</Text>
              {item.tips.slice(0, 2).map((tip) => <Text key={tip} style={{ color: colors.mutedForeground, fontFamily: typography.body, fontSize: 12 }}>• {tip}</Text>)}
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
