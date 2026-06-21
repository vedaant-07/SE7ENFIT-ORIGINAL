// My Gym — shows the user's linked gym (via gym code) + membership status.
import { Text, View } from 'react-native';
import { Building2, Calendar, Phone, MapPin } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import EmptyState from '@/components/se7enfit/EmptyState';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { userService, type UserProfile } from '@/services/userServices';
import { gymOwnerService, type GymOwner } from '@/services/gymOwnerServices';

export default function MyGym() {
  const profileReq = useAsync(() => userService.getProfile());
  const profile = profileReq.data as UserProfile | null;

  // Only fetch the gym owner profile if the user has a linked gym.
  const gymReq = useAsync(
    () => (profile?.gym_owner_id ? gymOwnerService.getMine() : Promise.resolve(null as GymOwner | null)),
    [profile?.gym_owner_id],
  );

  if (profileReq.loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="My Gym" showLogo />
      {profileReq.error ? <ErrorBanner>{profileReq.error}</ErrorBanner> : null}

      {!profile?.gym_owner_id ? (
        <EmptyState
          icon={<Building2 size={40} color={colors.mutedForeground} />}
          title="No gym linked"
          subtitle="Sign up with your gym's referral code to link it here."
        />
      ) : gymReq.loading ? (
        <LoadingScreen />
      ) : gymReq.data ? (
        <View style={{ gap: spacing.md }}>
          <Card style={{ alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
              <Building2 size={28} color={colors.accent} />
            </View>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 20, color: colors.foreground }}>{gymReq.data.gym_name}</Text>
            {gymReq.data.referral_code ? (
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent, marginTop: 4 }}>Code: {gymReq.data.referral_code}</Text>
            ) : null}
          </Card>

          {gymReq.data.gym_address ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <MapPin size={18} color={colors.mutedForeground} />
              <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.foreground, flex: 1 }}>
                {[gymReq.data.gym_address, gymReq.data.gym_city].filter(Boolean).join(', ')}
              </Text>
            </Card>
          ) : null}

          {gymReq.data.mobile ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Phone size={18} color={colors.mutedForeground} />
              <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.foreground, flex: 1 }}>{gymReq.data.mobile}</Text>
            </Card>
          ) : null}

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Calendar size={18} color={colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>Membership</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent }}>Active</Text>
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
