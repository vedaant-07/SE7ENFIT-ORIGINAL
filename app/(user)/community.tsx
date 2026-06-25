// Community — feed of posts with create.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Heart, MessageCircle, Plus, Send, Users } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { communityService } from '@/services/userServices';
import type { UserProfile } from '@/services/userServices';
import { userService } from '@/services/userServices';
import { useTheme } from '@/contexts/ThemeContext';

type Post = { id: string; content: string; author_name?: string; created_at?: string; likes?: number; comments?: number };

export default function Community() {
  const { colors, radius, spacing, typography } = useTheme();

  const { data, loading, error, reload } = useAsync(() => communityService.list());
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useState(() => {
    userService.getProfile().then(setProfile).catch(() => {});
  });

  const post = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      await communityService.create(draft.trim());
      setDraft('');
      reload();
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Community" showLogo />

      {/* Composer */}
      <Card style={{ marginBottom: spacing.md }}>
        <Input placeholder="Share your progress, tips, questions…" value={draft} onChangeText={setDraft} multiline style={{ minHeight: 80 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm }}>
          <Button label={posting ? 'Posting…' : 'Post'} onPress={post} loading={posting} size="sm" fullWidth={false} style={{ paddingHorizontal: 16, height: 38 }} />
        </View>
      </Card>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || (data as Post[]).length === 0 ? (
        <EmptyState icon={<Users size={40} color={colors.mutedForeground} />} title="Nothing here yet" subtitle="Be the first to share something with the community." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {(data as Post[]).map((p) => (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: typography.headingBold, fontSize: 13, color: colors.accent }}>{(p.author_name || profile?.name || 'A').charAt(0)}</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{p.author_name || profile?.name || 'Anonymous'}</Text>
                  {p.created_at ? <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</Text> : null}
                </View>
              </View>
              <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>{p.content}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Heart size={16} color={colors.mutedForeground} />
                  <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>{p.likes ?? 0}</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MessageCircle size={16} color={colors.mutedForeground} />
                  <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>{p.comments ?? 0}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
