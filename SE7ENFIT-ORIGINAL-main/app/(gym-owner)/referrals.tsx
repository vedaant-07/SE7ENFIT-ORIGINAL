import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Copy, Gift, MessageSquare, Ticket } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { referralService, type Referral } from '@/services/gymOwnerServices';
import { useTheme } from '@/contexts/ThemeContext';

const STATUS_COLOR: Record<Referral['status'], string> = {
  pending: '#F5A623',
  converted: '#29E06B',
};

export default function Referrals() {
  const { colors, spacing, typography } = useTheme();

  const { data, loading, error, reload } = useAsync(() => referralService.list());
  const [genBusy, setGenBusy] = useState(false);

  const generate = async () => {
    setGenBusy(true);
    try {
      await referralService.generateCode();
      reload();
    } finally {
      setGenBusy(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
    } catch {
      /* clipboard may be unavailable on web */
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Referrals" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || data.length === 0 ? (
        <>
          <EmptyState icon={<Gift size={40} color={colors.mutedForeground} />} title="No referrals yet" subtitle="Share your gym referral code to grow your member base." />
          <Button label={genBusy ? 'Generating…' : 'Generate Referral Code'} onPress={generate} loading={genBusy} />
        </>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Card>
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginBottom: spacing.xs }}>Your referral activity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontFamily: typography.headingBold, fontSize: 22, color: colors.accent }}>{data.length}</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground }}>total referrals</Text>
              <View style={{ marginLeft: 'auto' }}>
                <Button label="New Code" variant="outline" size="sm" fullWidth={false} onPress={generate} loading={genBusy} style={{ paddingHorizontal: 12, height: 34 }} />
              </View>
            </View>
          </Card>

          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.xs, marginTop: spacing.sm }}>All Referrals</Text>
          {data.map((r: Referral) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <MessageSquare size={14} color={colors.mutedForeground} />
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, flex: 1 }}>
                  {r.referred_name || r.referred_email || 'Anonymous lead'}
                </Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${STATUS_COLOR[r.status]}20` }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: STATUS_COLOR[r.status], textTransform: 'uppercase' }}>{r.status}</Text>
                </View>
              </View>
              <Pressable onPress={() => copyCode(r.referral_code)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ticket size={12} color={colors.accent} />
                <Text style={{ fontFamily: typography.heading, fontSize: 13, color: colors.accent }}>{r.referral_code}</Text>
                <Copy size={12} color={colors.mutedForeground} />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
