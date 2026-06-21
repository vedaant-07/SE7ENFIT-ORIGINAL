import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, Trash2, Trophy } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { ownerChallengeService, type OwnerChallenge } from '@/services/gymOwnerServices';

export default function OwnerChallenges() {
  const { data, loading, error, reload } = useAsync(() => ownerChallengeService.list());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reward, setReward] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await ownerChallengeService.create({ title: title.trim(), description: desc.trim(), reward });
      setTitle(''); setDesc(''); setReward(''); setAdding(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Gym Challenges" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>New Challenge</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Title" value={title} onChangeText={setTitle} />
            <Input placeholder="Description" value={desc} onChangeText={setDesc} multiline style={{ minHeight: 70 }} />
            <Input placeholder="Reward (e.g. 1 month free)" value={reward} onChangeText={setReward} />
            <Button label={busy ? 'Creating…' : 'Create'} onPress={create} loading={busy} />
          </View>
        </Card>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Trophy size={40} color={colors.mutedForeground} />} title="No challenges yet" subtitle="Create challenges to keep your members engaged." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((c: OwnerChallenge) => (
            <Card key={c.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Trophy size={16} color={colors.accent} />
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, flex: 1 }}>{c.title}</Text>
                <Pressable onPress={async () => { await ownerChallengeService.remove(c.id); reload(); }} hitSlop={12}>
                  <Trash2 size={16} color={colors.error} />
                </Pressable>
              </View>
              {c.description ? <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, marginTop: spacing.xs, lineHeight: 20 }}>{c.description}</Text> : null}
              {c.reward ? (
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 11, color: colors.accent, marginTop: spacing.xs }}>Reward: {c.reward}</Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
