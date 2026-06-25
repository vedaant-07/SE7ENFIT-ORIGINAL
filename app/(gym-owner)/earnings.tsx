import { Text, View } from 'react-native';
import { IndianRupee } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import StatCard from '@/components/se7enfit/StatCard';
import TopBar from '@/components/se7enfit/TopBar';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { earningsService, type EarningSummary } from '@/services/gymOwnerServices';
import { useTheme } from '@/contexts/ThemeContext';

function formatINR(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function Earnings() {
  const { colors, spacing, typography } = useTheme();

  const { data, loading, error } = useAsync<EarningSummary>(() => earningsService.summary());

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Earnings" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {data ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
            <StatCard icon={<IndianRupee size={16} color={colors.accent} />} label="This Month" value={formatINR(data.this_month)} />
            <StatCard icon={<IndianRupee size={16} color="#F5A623" />} label="Pending" value={formatINR(data.pending)} color="#F5A623" />
          </View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>Total Revenue</Text>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 28, color: colors.accent, marginTop: 4 }}>
              {formatINR(data.total_revenue)}
            </Text>
          </Card>

          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Recent Transactions</Text>
          {data.recent.length === 0 ? (
            <EmptyState title="No transactions yet" />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {data.recent.map((t) => (
                <Card key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{t.member_name || t.type}</Text>
                    <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{t.type} · {new Date(t.date).toLocaleDateString('en-IN')}</Text>
                  </View>
                  <Text style={{ fontFamily: typography.headingBold, fontSize: 15, color: colors.accent }}>{formatINR(t.amount)}</Text>
                </Card>
              ))}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}
