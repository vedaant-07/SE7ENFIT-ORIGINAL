import { useState } from 'react';
import { Text, View } from 'react-native';
import { Gift, Star, Ticket } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { rewardService, type Reward } from '@/services/userServices';

export default function Rewards() {
  const { data, loading, error, reload } = useAsync(() => rewardService.list());
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const redeem = async (r: Reward) => {
    setRedeeming(r.id);
    try {
      await rewardService.redeem(r.id);
      reload();
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Rewards" showLogo />

      {/* Points hero */}
      <Card elevated style={{ alignItems: 'center', marginBottom: spacing.lg, paddingVertical: spacing.xl }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
          <Star size={28} color={colors.accent} fill={colors.accent} />
        </View>
        <Text style={{ fontFamily: typography.display, fontSize: 38, color: colors.accent }}>2,450</Text>
        <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground }}>Reward Points</Text>
      </Card>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Available Rewards</Text>

      {!data || data.length === 0 ? (
        <EmptyState icon={<Gift size={40} color={colors.mutedForeground} />} title="No rewards yet" subtitle="Earn points by completing workouts and challenges." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((r: Reward) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: r.description ? spacing.sm : 0 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{r.title}</Text>
                  <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent }}>{r.points_cost} points</Text>
                </View>
              </View>
              {r.description ? (
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>{r.description}</Text>
              ) : null}
              <Button
                label={r.redeemed ? 'Redeemed' : 'Redeem'}
                variant={r.redeemed ? 'ghost' : 'accent'}
                size="sm"
                fullWidth={false}
                onPress={() => redeem(r)}
                loading={redeeming === r.id}
                disabled={r.redeemed}
                style={{ marginTop: spacing.md, alignSelf: 'stretch', height: 40 }}
              />
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
