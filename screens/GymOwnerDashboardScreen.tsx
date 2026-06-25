import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  IndianRupee,
  LogOut,
  Megaphone,
  Star,
  Ticket,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import Logo from '@/components/se7enfit/Logo';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import GymOwnerBottomNav from '@/components/se7enfit/GymOwnerBottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { gymOwnerService, type GymOwner } from '@/services/gymOwnerServices';
import { earningsService } from '@/services/gymOwnerServices';
import type { EarningSummary } from '@/services/gymOwnerServices';

type NavTile = {
  icon: LucideIcon;
  label: string;
  href: Href;
  desc: string;
};

const NAV_TILES: NavTile[] = [
  { icon: Users, label: 'Members', href: '/(gym-owner)/members', desc: 'Active & expired' },
  { icon: ClipboardList, label: 'Attendance', href: '/(gym-owner)/attendance', desc: 'Check-ins today' },
  { icon: Trophy, label: 'Leads', href: '/(gym-owner)/leads', desc: 'New & converted' },
  { icon: IndianRupee, label: 'Earnings', href: '/(gym-owner)/earnings', desc: 'Revenue & payouts' },
  { icon: Megaphone, label: 'Promotions', href: '/(gym-owner)/advertisements', desc: 'Ads & offers' },
  { icon: Bell, label: 'Announcements', href: '/(gym-owner)/announcements', desc: 'Posts to members' },
  { icon: Dumbbell, label: 'Equipment', href: '/(gym-owner)/equipment', desc: 'Inventory state' },
  { icon: Trophy, label: 'Challenges', href: '/(gym-owner)/owner-challenges', desc: 'Gym challenges' },
  { icon: Ticket, label: 'Rewards', href: '/(gym-owner)/owner-rewards', desc: 'Member rewards' },
  { icon: Star, label: 'Reviews', href: '/(gym-owner)/reviews', desc: 'Ratings & replies' },
  { icon: Building2, label: 'Gym Profile', href: '/(gym-owner)/gym-profile', desc: 'Public profile' },
];

function SmallStat({ label, value, color }: { label: string; value: string; color: string }) {
  const { colors, radius, typography } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
      }}
    >
      <Text style={{ fontFamily: typography.headingBold, fontSize: 17, color }}>{value}</Text>
      <Text style={{ marginTop: 4, fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

export default function GymOwnerDashboardScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { colors, radius, spacing, typography } = useTheme();
  const [owner, setOwner] = useState<GymOwner | null>(null);
  const [earnings, setEarnings] = useState<EarningSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, e] = await Promise.allSettled([
          gymOwnerService.getMine(),
          earningsService.summary(),
        ]);
        if (o.status === 'fulfilled') setOwner(o.value);
        if (e.status === 'fulfilled') setEarnings(e.value);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const gymName = owner?.gym_name || 'SE7ENFIT Gym';
  const ownerName = owner?.owner_name || (user as { email?: string })?.email || 'Gym Owner';
  const thisMonth = earnings?.this_month ?? 1199;
  const totalRevenue = earnings?.total_revenue ?? thisMonth;
  const pending = earnings?.pending ?? 0;

  return (
    <>
      <Screen withBottomNavPadding contentContainerStyle={{ paddingBottom: 132 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Logo size={22} />
            <Text style={{ marginTop: 5, fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
              {gymName}
            </Text>
          </View>
          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/welcome');
            }}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: radius.full,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <LogOut size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <Card accent style={{ marginBottom: spacing.lg, backgroundColor: colors.accent, borderColor: colors.accent }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.accentForeground, opacity: 0.72 }}>
                Total Earnings
              </Text>
              <Text style={{ marginTop: 5, fontFamily: typography.headingBold, fontSize: 34, color: colors.accentForeground }}>
                ₹{thisMonth.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={23} color={colors.accentForeground} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {['Daily', 'Weekly', 'Monthly', 'Total'].map((item, index) => (
              <View key={item} style={{ flex: 1, height: 26, borderRadius: radius.full, backgroundColor: index === 2 ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.18)' }} />
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <SmallStat label="Members" value="1" color={colors.accent} />
          <SmallStat label="Pending Leads" value="0" color={colors.warning} />
          <SmallStat label="Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color={colors.blue} />
          <SmallStat label="Pending" value={`₹${pending.toLocaleString('en-IN')}`} color={colors.purple} />
        </View>

        <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground, marginBottom: spacing.md }}>
          More Features
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: spacing.lg }}>
          {NAV_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Pressable
                key={tile.label}
                onPress={() => router.push(tile.href)}
                style={({ pressed }) => ({
                  width: '33.333%',
                  padding: 5,
                  opacity: pressed ? 0.78 : 1,
                })}
              >
                <View
                  style={{
                    minHeight: 98,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    padding: 12,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={18} color={colors.accent} />
                  </View>
                  <Text numberOfLines={1} style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.foreground }}>
                    {tile.label}
                  </Text>
                  <Text numberOfLines={2} style={{ marginTop: 3, fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground, lineHeight: 14 }}>
                    {tile.desc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Building2 size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>
                SE7EN-FIT Gym Code
              </Text>
              <Text style={{ marginTop: 3, fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                Share this code with members
              </Text>
            </View>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 14, color: colors.accent }}>
              {owner?.referral_code || 'SE7ENFIT'}
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ flex: 1, fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>
            Recent Members
          </Text>
          <Pressable onPress={() => router.push('/(gym-owner)/members')}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.accent }}>View All</Text>
          </Pressable>
        </View>
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <Pressable onPress={() => router.push('/(gym-owner)/members')} style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: radius.full, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Users size={19} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>Member Activity</Text>
              <Text style={{ marginTop: 3, fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>Open members list and attendance</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </Pressable>
        </Card>
      </Screen>
      <GymOwnerBottomNav />
    </>
  );
}
