import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, Plus, Trash2 } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { announcementService, type Announcement } from '@/services/gymOwnerServices';

export default function Announcements() {
  const { data, loading, error, reload } = useAsync(() => announcementService.list());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await announcementService.create({ title: title.trim(), body: body.trim() });
      setTitle(''); setBody(''); setAdding(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await announcementService.remove(id);
    reload();
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Announcements" right={
        <Pressable onPress={() => setAdding((a) => !a)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      } />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {adding ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>New Announcement</Text>
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Title" value={title} onChangeText={setTitle} />
            <Input placeholder="Message (optional)" value={body} onChangeText={setBody} multiline style={{ minHeight: 80 }} />
            <Button label={busy ? 'Posting…' : 'Post'} onPress={create} loading={busy} />
          </View>
        </Card>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Bell size={40} color={colors.mutedForeground} />} title="No announcements" subtitle="Post updates, offers, or alerts to your members." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((a: Announcement) => (
            <Card key={a.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <Bell size={14} color={colors.accent} />
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, flex: 1 }}>{a.title}</Text>
                <Pressable onPress={() => remove(a.id)} hitSlop={12}>
                  <Trash2 size={16} color={colors.error} />
                </Pressable>
              </View>
              {a.body ? <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>{a.body}</Text> : null}
              {a.created_at ? (
                <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: spacing.xs }}>
                  {new Date(a.created_at).toLocaleDateString('en-IN')}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
