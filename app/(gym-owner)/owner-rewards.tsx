import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, Trash2, Ticket } from 'lucide-react-native';
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
import { ownerRewardService, type OwnerReward } from '@/services/gymOwnerServices';

export default function OwnerRewards() {
  const { data, loading, error, reload } = useAsync(() => ownerRewardService.list());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await ownerRewardService.create({ title: title.trim(), description: desc.trim(), points_cost: Number(cost) || 0 });
      setTitle(''); setDesc(''); setCost(''); setAdding(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Member Rewards" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>New Reward</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Title" value={title} onChangeText={setTitle} />
            <Input placeholder="Description" value={desc} onChangeText={setDesc} multiline style={{ minHeight: 70 }} />
            <Input placeholder="Points cost" value={cost} onChangeText={setCost} keyboardType="numeric" />
            <Button label={busy ? 'Creating…' : 'Create'} onPress={create} loading={busy} />
          </View>
        </Card>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Ticket size={40} color={colors.mutedForeground} />} title="No rewards yet" subtitle="Offer redeemable rewards to your members." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((r: OwnerReward) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Ticket size={16} color={colors.accent} />
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, flex: 1 }}>{r.title}</Text>
                <Text style={{ fontFamily: typography.headingBold, fontSize: 13, color: colors.accent }}>{r.points_cost} pts</Text>
                <Pressable onPress={async () => { await ownerRewardService.remove(r.id); reload(); }} hitSlop={12}>
                  <Trash2 size={16} color={colors.error} />
                </Pressable>
              </View>
              {r.description ? <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, marginTop: spacing.xs, lineHeight: 20 }}>{r.description}</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
