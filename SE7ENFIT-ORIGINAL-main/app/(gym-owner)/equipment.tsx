import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Dumbbell, Plus, Trash2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { equipmentService, type Equipment } from '@/services/gymOwnerServices';
import { useTheme } from '@/contexts/ThemeContext';

const CONDITION_COLOR: Record<NonNullable<Equipment['condition']>, string> = {
  new: '#29E06B',
  good: '#38BDF8',
  needs_repair: '#F5A623',
};

export default function EquipmentScreen() {
  const { colors, radius, spacing, typography } = useTheme();

  const { data, loading, error, reload } = useAsync(() => equipmentService.list());
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [qty, setQty] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await equipmentService.create({ name: name.trim(), category, quantity: Number(qty) || 1 });
      setName(''); setCategory(''); setQty(''); setAdding(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Equipment" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>Add Equipment</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Name (e.g. Treadmill)" value={name} onChangeText={setName} />
            <Input placeholder="Category" value={category} onChangeText={setCategory} />
            <Input placeholder="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
            <Button label={busy ? 'Saving…' : 'Add'} onPress={create} loading={busy} />
          </View>
        </Card>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Dumbbell size={40} color={colors.mutedForeground} />} title="No equipment logged" subtitle="Track what's in your gym." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((e: Equipment) => (
            <Card key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={16} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{e.name}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
                  {e.category ? `${e.category} · ` : ''}Qty: {e.quantity}
                </Text>
              </View>
              {e.condition ? (
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: `${CONDITION_COLOR[e.condition]}20` }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: CONDITION_COLOR[e.condition], textTransform: 'uppercase' }}>
                    {e.condition.replace('_', ' ')}
                  </Text>
                </View>
              ) : null}
              <Pressable onPress={async () => { await equipmentService.remove(e.id); reload(); }} hitSlop={12}>
                <Trash2 size={16} color={colors.error} />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
