import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell, Building2, ChevronRight, ClipboardList, Dumbbell, IndianRupee,
  LogOut, MessageSquare, Megaphone, Settings, Star, Ticket, Trophy, Users,
} from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import StatCard from '@/components/se7enfit/StatCard';
import TopBar from '@/components/se7enfit/TopBar';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { gymOwnerService, type GymOwner } from '@/services/gymOwnerServices';
import { earningsService } from '@/services/gymOwnerServices';
import type { EarningSummary } from '@/services/gymOwnerServices';

type NavTile = {
  icon: typeof Bell;
  label: string;
  href: string;
  desc: string;
};

const NAV_TILES: NavTile[] = [
  { icon: Users, label: 'Members', href: '/(gym-owner)/members', desc: 'Active & expired' },
  { icon: ClipboardList, label: 'Attendance', href: '/(gym-owner)/attendance', desc: 'Check-ins today' },
  { icon: Trophy, label: 'Leads', href: '/(gym-owner)/leads', desc: 'New & converted' },
  { icon: IndianRupee, label: 'Earnings', href: '/(gym-owner)/earnings', desc: 'Revenue & payouts' },
  { icon: Megaphone, label: 'Promotions', href: '/(gym-owner)/advertisements', desc: 'Ads & offers to members' },
  { icon: Bell, label: 'Announcements', href: '/(gym-owner)/announcements', desc: 'Posts to members' },
  { icon: Dumbbell, label: 'Equipment', href: '/(gym-owner)/equipment', desc: 'Inventory & state' },
  { icon: Trophy, label: 'Challenges', href: '/(gym-owner)/owner-challenges', desc: 'Gym challenges' },
  { icon: Ticket, label: 'Rewards', href: '/(gym-owner)/owner-rewards', desc: 'Member rewards' },
  { icon: Star, label: 'Reviews', href: '/(gym-owner)/reviews', desc: 'Ratings & replies' },
  { icon: MessageSquare, label: 'Referrals', href: '/(gym-owner)/referrals', desc: 'Code & conversions' },
  { icon: Building2, label: 'Gym Profile', href: '/(gym-owner)/gym-profile', desc: 'Public-facing info' },
];

export default function GymOwnerDashboard() {
  const router = useRouter();
  const { logout, user } = useAuth();
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

  return (
    <Screen>
      <TopBar
        title={owner?.gym_name || 'Dashboard'}
        showLogo
        right={
          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/welcome');
            }}
            hitSlop={12}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}
          >
            <LogOut size={18} color={colors.foreground} />
          </Pressable>
        }
      />

      {/* Greeting */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
          Welcome back,
        </Text>
        <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>
          {owner?.owner_name || (user as { email?: string })?.email || 'Gym Owner'}
        </Text>
        {owner?.referral_code ? (
          <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent, marginTop: 4 }}>
            Referral code: {owner.referral_code}
          </Text>
        ) : null}
      </Card>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatCard
          icon={<IndianRupee size={16} color={colors.accent} />}
          label="This Month"
          value={`₹${(earnings?.this_month ?? 0).toLocaleString('en-IN')}`}
          caption={`${(earnings?.total_revenue ?? 0).toLocaleString('en-IN')} total`}
        />
        <StatCard
          icon={<Users size={16} color="#38BDF8" />}
          label="Members"
          value="—"
          color="#38BDF8"
          caption="Active: —"
        />
        <StatCard
          icon={<ClipboardList size={16} color="#F5A623" />}
          label="Pending"
          value={`₹${(earnings?.pending ?? 0).toLocaleString('en-IN')}`}
          color="#F5A623"
        />
      </View>

      {/* Nav grid */}
      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.md }}>
        Management
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 }}>
        {NAV_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <Pressable
              key={tile.label}
              onPress={() => router.push(tile.href)}
              style={({ pressed }) => ({
                width: '50%',
                padding: 3,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{tile.label}</Text>
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>{tile.desc}</Text>
                </View>
                <ChevronRight size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
