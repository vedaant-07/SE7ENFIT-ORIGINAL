import { useState } from 'react';
import { Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { reviewService, type Review } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

export default function Reviews() {
  const { colors, spacing, typography } = useTheme();

  const { data, loading, error, reload } = useAsync(() => reviewService.list());
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [replyErr, setReplyErr] = useState('');

  const sendReply = async () => {
    if (!replyTo || !reply.trim()) return;
    setBusy(true);
    setReplyErr('');
    try {
      await reviewService.reply(replyTo, reply.trim());
      setReply(''); setReplyTo(null);
      reload();
    } catch (e) {
      setReplyErr(e instanceof ApiError ? e.message : 'Could not send reply');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Reviews" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Star size={40} color={colors.mutedForeground} />} title="No reviews yet" subtitle="Member reviews and ratings appear here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((r: Review) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} color={i < r.rating ? colors.warning : colors.secondary} fill={i < r.rating ? colors.warning : 'transparent'} />
                ))}
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.mutedForeground, marginLeft: spacing.xs }}>
                  {r.member_name || 'Anonymous'}
                </Text>
              </View>
              {r.comment ? (
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.foreground, lineHeight: 20 }}>{r.comment}</Text>
              ) : null}

              {replyTo === r.id ? (
                <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                  <Input placeholder="Write a public reply…" value={reply} onChangeText={setReply} multiline style={{ minHeight: 60 }} />
                  {replyErr ? <ErrorBanner>{replyErr}</ErrorBanner> : null}
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button label="Cancel" variant="ghost" onPress={() => { setReplyTo(null); setReply(''); }} />
                    <Button label={busy ? 'Sending…' : 'Send'} onPress={sendReply} loading={busy} />
                  </View>
                </View>
              ) : (
                <Button label="Reply" variant="outline" size="sm" fullWidth={false} onPress={() => setReplyTo(r.id)} style={{ marginTop: spacing.sm, paddingHorizontal: 14, height: 34 }} />
              )}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
