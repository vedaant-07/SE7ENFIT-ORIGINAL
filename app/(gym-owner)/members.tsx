import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, Users } from 'lucide-react-native';
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
import { memberService, type GymMember } from '@/services/gymOwnerServices';

const STATUS_COLOR: Record<GymMember['status'], string> = {
  active: colors.accent,
  expired: colors.error,
  frozen: colors.warning,
};

export default function Members() {
  const { data, loading, error, reload } = useAsync(() => memberService.list());
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await memberService.create({ name: name.trim(), mobile, plan });
      setName(''); setMobile(''); setPlan('');
      setAdding(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not add member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Members" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>Add Member</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Full name" value={name} onChangeText={setName} />
            <Input placeholder="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Input placeholder="Plan (e.g. Monthly)" value={plan} onChangeText={setPlan} />
            {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Cancel" variant="ghost" onPress={() => setAdding(false)} />
              <Button label={saving ? 'Saving…' : 'Add'} onPress={submit} loading={saving} />
            </View>
          </View>
        </Card>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Users size={40} color={colors.mutedForeground} />} title="No members yet" subtitle="Add your first member to start tracking." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((m) => (
            <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: typography.headingBold, fontSize: 16, color: colors.accent }}>
                  {m.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{m.name}</Text>
                <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
                  {m.plan ? `${m.plan} · ` : ''}{m.mobile || 'No mobile'}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: `${STATUS_COLOR[m.status]}20` }}>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: STATUS_COLOR[m.status], textTransform: 'uppercase' }}>
                  {m.status}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
