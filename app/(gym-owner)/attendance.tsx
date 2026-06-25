import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar, ClipboardList, LogIn, LogOut } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import EmptyState from '@/components/se7enfit/EmptyState';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { useAsync } from '@/hooks/useAsync';
import { attendanceService, type AttendanceRecord } from '@/services/gymOwnerServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function Attendance() {
  const { colors, spacing, typography } = useTheme();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, loading, error, reload } = useAsync(() => attendanceService.list({ date }), [date]);
  const [memberId, setMemberId] = useState('');
  const [busy, setBusy] = useState<'in' | 'out' | null>(null);
  const [actionErr, setActionErr] = useState('');

  const act = async (kind: 'in' | 'out') => {
    setActionErr('');
    if (!memberId.trim()) {
      setActionErr('Enter a member ID');
      return;
    }
    setBusy(kind);
    try {
      if (kind === 'in') await attendanceService.checkIn(memberId.trim());
      else await attendanceService.checkOut(memberId.trim());
      setMemberId('');
      reload();
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Attendance" />
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <Input label="Date" leftIcon={<Calendar size={16} color={colors.mutedForeground} />} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Quick Check-in / Out</Text>
        <Input placeholder="Member ID" value={memberId} onChangeText={setMemberId} />
        {actionErr ? <ErrorBanner>{actionErr}</ErrorBanner> : null}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <Button label={busy === 'in' ? '…' : 'Check In'} onPress={() => act('in')} loading={busy === 'in'} />
          <Button label={busy === 'out' ? '…' : 'Check Out'} variant="outline" onPress={() => act('out')} loading={busy === 'out'} />
        </View>
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Today's Log</Text>
        {!data || data.length === 0 ? (
          <EmptyState icon={<ClipboardList size={40} color={colors.mutedForeground} />} title="No check-ins yet" subtitle="Members will appear here after checking in." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {data.map((r: AttendanceRecord) => (
              <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <LogIn size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>
                    {r.member_name || `Member ${r.member_id}`}
                  </Text>
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                    In: {formatTime(r.check_in_at)}{r.check_out_at ? ` · Out: ${formatTime(r.check_out_at)}` : ''}
                  </Text>
                </View>
                {r.check_out_at ? null : <LogOut size={14} color={colors.warning} />}
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
