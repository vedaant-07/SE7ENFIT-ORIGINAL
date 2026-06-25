import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, Check } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { notificationService, type AppNotification } from '@/services/userServices';
import { useTheme } from '@/contexts/ThemeContext';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN');
  } catch {
    return iso;
  }
}

export default function Notifications() {
  const { colors, spacing, typography } = useTheme();

  const { data, loading, error, reload } = useAsync(() => notificationService.list());
  const [marking, setMarking] = useState(false);

  const markAll = async () => {
    setMarking(true);
    try {
      await notificationService.markAllRead();
      reload();
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar
        title="Notifications"
        right={
          <Button label="Read all" variant="ghost" size="sm" fullWidth={false} onPress={markAll} loading={marking} style={{ paddingHorizontal: 10, height: 34 }} />
        }
      />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {!data || data.length === 0 ? (
        <EmptyState icon={<Bell size={40} color={colors.mutedForeground} />} title="All caught up" subtitle="Your notifications will appear here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.map((n: AppNotification) => (
            <Pressable key={n.id} onPress={() => notificationService.markRead(n.id).then(reload)}>
              <Card style={{ flexDirection: 'row', gap: spacing.md, opacity: n.read ? 0.6 : 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: n.read ? colors.secondary : colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  {n.read ? <Check size={16} color={colors.mutedForeground} /> : <Bell size={16} color={colors.accent} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground }}>{n.title}</Text>
                  {n.body ? (
                    <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, marginTop: 2, lineHeight: 20 }}>{n.body}</Text>
                  ) : null}
                  {n.created_at ? (
                    <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}>{formatTime(n.created_at)}</Text>
                  ) : null}
                </View>
                {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 }} /> : null}
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
