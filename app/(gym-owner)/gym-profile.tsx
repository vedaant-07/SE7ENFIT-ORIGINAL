import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Building2, MapPin, Phone } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import ThemeModeSelector from '@/components/se7enfit/ThemeModeSelector';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';

import { gymOwnerService, type GymOwner } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

export default function GymProfile() {
  const { colors, spacing, typography } = useTheme();

  const [owner, setOwner] = useState<GymOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<GymOwner>>({});

  useEffect(() => {
    (async () => {
      try {
        const o = await gymOwnerService.getMine();
        setOwner(o);
        setForm(o);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Could not load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await gymOwnerService.upsert(form);
      setOwner(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const set = (k: keyof GymOwner) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Screen>
      <TopBar title="Gym Profile" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {owner && (
        <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
            <Building2 size={28} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>{owner.gym_name || 'Unnamed Gym'}</Text>
          {owner.referral_code ? (
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent, marginTop: 4 }}>Code: {owner.referral_code}</Text>
          ) : null}
        </Card>
      )}

      <Card style={{ marginBottom: spacing.lg }}>
        <ThemeModeSelector />
      </Card>

      <View style={{ gap: spacing.md }}>
        <Input label="Gym Name" leftIcon={<Building2 size={16} color={colors.mutedForeground} />} value={form.gym_name || ''} onChangeText={set('gym_name')} />
        <Input label="Address" leftIcon={<MapPin size={16} color={colors.mutedForeground} />} value={form.gym_address || ''} onChangeText={set('gym_address')} multiline style={{ minHeight: 70 }} />
        <Input label="City" value={form.gym_city || ''} onChangeText={set('gym_city')} />
        <Input label="Contact Number" leftIcon={<Phone size={16} color={colors.mutedForeground} />} value={form.mobile || ''} onChangeText={set('mobile')} keyboardType="phone-pad" />
        <Button label={saving ? 'Saving…' : 'Save Changes'} onPress={save} loading={saving} />
      </View>
    </Screen>
  );
}
