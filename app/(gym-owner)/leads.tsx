import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, Trophy, UserPlus } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { leadService, type Lead } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';

const STATUS_COLOR: Record<Lead['status'], string> = {
  new: colors.accent,
  contacted: '#38BDF8',
  converted: colors.accent,
  lost: colors.error,
};

const STATUSES: Lead['status'][] = ['new', 'contacted', 'converted', 'lost'];

export default function Leads() {
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');
  const { data, loading, error, reload } = useAsync(() => leadService.list(filter === 'all' ? undefined : { status: filter }), [filter]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);

  const addLead = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await leadService.create({ name: name.trim(), mobile, status: 'new' });
      setName(''); setMobile(''); setAdding(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Leads" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>Add Lead</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Full name" value={name} onChangeText={setName} />
            <Input placeholder="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Button label={busy ? 'Adding…' : 'Add Lead'} onPress={addLead} loading={busy} />
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md, flexWrap: 'wrap' }}>
        <Pressable onPress={() => setFilter('all')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: filter === 'all' ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 11, color: filter === 'all' ? colors.accentForeground : colors.foreground, fontFamily: typography.bodySemibold }}>All</Text>
        </Pressable>
        {STATUSES.map((s) => (
          <Pressable key={s} onPress={() => setFilter(s)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: filter === s ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 11, color: filter === s ? colors.accentForeground : colors.foreground, fontFamily: typography.bodySemibold, textTransform: 'capitalize' }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {!data || data.length === 0 ? (
        <EmptyState icon={<UserPlus size={40} color={colors.mutedForeground} />} title="No leads" subtitle="Add prospects to track them through your pipeline." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((l: Lead) => (
            <Card key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={16} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{l.name}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>{l.mobile || 'No mobile'}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: `${STATUS_COLOR[l.status]}20` }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: STATUS_COLOR[l.status], textTransform: 'uppercase' }}>{l.status}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
