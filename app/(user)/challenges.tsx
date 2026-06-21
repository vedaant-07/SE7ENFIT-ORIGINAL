import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, Trophy } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import ProgressRing from '@/components/se7enfit/ProgressRing';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { challengeService, type Challenge } from '@/services/userServices';

export default function Challenges() {
  const { data, loading, error, reload } = useAsync(() => challengeService.list());
  const [joining, setJoining] = useState<string | null>(null);

  const joinLeave = async (c: Challenge) => {
    setJoining(c.id);
    try {
      if (c.joined) await challengeService.leave(c.id);
      else await challengeService.join(c.id);
      reload();
    } finally {
      setJoining(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Challenges" showLogo />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Trophy size={40} color={colors.mutedForeground} />} title="No challenges" subtitle="Check back soon — new challenges appear here." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {data.map((c: Challenge) => (
            <Card key={c.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 15, color: colors.foreground }}>{c.title}</Text>
                  {c.participants != null ? (
                    <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                      {c.participants} participants
                    </Text>
                  ) : null}
                </View>
                <ProgressRing size={40} strokeWidth={4} progress={(c.progress ?? 0) / 100} value={`${c.progress ?? 0}%`} />
              </View>

              {c.description ? (
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>{c.description}</Text>
              ) : null}
              {c.reward ? (
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.accent, marginTop: spacing.xs }}>Reward: {c.reward}</Text>
              ) : null}

              <Button
                label={c.joined ? 'Joined' : 'Join Challenge'}
                variant={c.joined ? 'outline' : 'accent'}
                size="sm"
                fullWidth={false}
                onPress={() => joinLeave(c)}
                loading={joining === c.id}
                style={{ marginTop: spacing.md, alignSelf: 'stretch', height: 40 }}
              >
                {c.joined ? <Check size={14} color={colors.accent} /> : null}
              </Button>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
