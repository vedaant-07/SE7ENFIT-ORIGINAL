import { useEffect, useState, useCallback, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Bot, Camera, ChevronRight, Crown, Dumbbell, Flame, Droplets, Footprints, Moon, Scale, Utensils, Trophy, TrendingUp, Zap } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import ProgressRing from '@/components/se7enfit/ProgressRing';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import Logo from '@/components/se7enfit/Logo';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userServices';
import type { UserProfile } from '@/services/userServices';
import AdvertisementCarousel from '@/src/components/user/AdvertisementCarousel';
import {
  getUserDashboardAdvertisements,
  trackAdvertisementImpression,
  trackAdvertisementClick,
} from '@/services/advertisementService';
import type { Advertisement } from '@/src/types/advertisement';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

type TodayStat = {
  icon: typeof Flame;
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
};

const TODAY: TodayStat[] = [
  { icon: Flame, label: 'Calories', value: 1240, goal: 2200, unit: 'kcal', color: '#F5A623' },
  { icon: Utensils, label: 'Protein', value: 92, goal: 140, unit: 'g', color: colors.accent },
  { icon: Droplets, label: 'Water', value: 1.2, goal: 3.0, unit: 'L', color: '#38BDF8' },
  { icon: Footprints, label: 'Steps', value: 5430, goal: 10000, unit: '', color: '#A78BFA' },
  { icon: Moon, label: 'Sleep', value: 6.5, goal: 8, unit: 'h', color: '#F472B6' },
];

function StatPill({ icon: Icon, label, value, unit, progress }: { icon: typeof Flame; label: string; value: number; unit: string; progress: number }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <ProgressRing size={64} strokeWidth={5} progress={progress} value={`${value}`} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon size={11} color={colors.mutedForeground} />
        <Text style={{ fontSize: 10, fontFamily: typography.body, color: colors.mutedForeground }}>
          {label}{unit ? ` · ${unit}` : ''}
        </Text>
      </View>
    </View>
  );
}

type QuickAction = { icon: typeof Bot; label: string; href: string; color: string };

const QUICK_ACTIONS: QuickAction[] = [
  { icon: Bot, label: 'AI Trainer', href: '/(user)/ai-trainer', color: colors.accent },
  { icon: Dumbbell, label: 'Workout', href: '/(user)/workout', color: '#F5A623' },
  { icon: Utensils, label: 'Nutrition', href: '/(user)/nutrition', color: '#38BDF8' },
  { icon: Camera, label: 'Food Scan', href: '/(user)/food-scan', color: '#A78BFA' },
  { icon: Activity, label: 'Tracking', href: '/(user)/tracking', color: '#F472B6' },
  { icon: Trophy, label: 'Challenges', href: '/(user)/challenges', color: colors.accent },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);

  // Track which impressions we've already sent this session
  const trackedImpressions = useRef<Set<string>>(new Set());
  const trackedClicks = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const p = await userService.getProfile();
        setProfile(p);
      } catch {
        // Profile may not exist yet → onboarding.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch advertisements
  useEffect(() => {
    (async () => {
      try {
        const ads = await getUserDashboardAdvertisements();
        setAdvertisements(ads || []);
      } catch {
        // Silently fail - don't show ads if API unavailable
        setAdvertisements([]);
      } finally {
        setAdsLoading(false);
      }
    })();
  }, []);

  // Handle impression tracking (once per ad per session)
  const handleImpression = useCallback((adId: string) => {
    if (trackedImpressions.current.has(adId)) return;
    trackedImpressions.current.add(adId);
    trackAdvertisementImpression(adId);
  }, []);

  // Handle click tracking
  const handleClick = useCallback((adId: string) => {
    if (trackedClicks.current.has(adId)) return;
    trackedClicks.current.add(adId);
    trackAdvertisementClick(adId);
  }, []);

  if (loading) return <LoadingScreen />;

  const firstName = profile?.name?.split(' ')[0] || 'Athlete';

  return (
    <Screen withBottomNavPadding>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>
            {getGreeting()},
          </Text>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 20, color: colors.foreground }}>
            {firstName} 👋
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(user)/notifications')} hitSlop={12} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color={colors.accent} />
        </Pressable>
        <Pressable onPress={() => router.push('/(user)/profile')} hitSlop={12} style={{ marginLeft: spacing.sm, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Scale size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Advertisement Carousel - shows below header, above progress */}
      {!adsLoading && advertisements.length > 0 && (
        <AdvertisementCarousel
          advertisements={advertisements}
          onImpression={handleImpression}
          onClick={handleClick}
        />
      )}

      {/* Hero card with overall progress */}
      <Card elevated style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <ProgressRing size={84} strokeWidth={8} progress={0.62} value="62%" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground }}>Today's Goal</Text>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>
              4 of 6 habits done
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <TrendingUp size={12} color={colors.accent} />
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.accent }}>On track for today</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Today's stats ring row */}
      <Card style={{ marginBottom: spacing.lg }} padded={false}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>Today's Activity</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.sm, paddingBottom: spacing.lg }}>
          {TODAY.map((s) => (
            <StatPill key={s.label} icon={s.icon} label={s.label} value={s.value} unit={s.unit} progress={s.value / s.goal} />
          ))}
        </View>
      </Card>

      {/* Quick actions grid */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.md }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 }}>
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <Pressable
                key={qa.label}
                onPress={() => router.push(qa.href)}
                style={({ pressed }) => ({
                  width: '33.333%',
                  padding: spacing.md,
                  margin: 3,
                  borderRadius: radius.md,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 8,
                  opacity: pressed ? 0.86 : 1,
                })}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${qa.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={qa.color} />
                </View>
                <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{qa.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* AI Daily Tip */}
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={16} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>AI Daily Tip</Text>
          <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
            <Crown size={12} color={colors.warning} />
            <Text style={{ fontSize: 10, color: colors.warning, marginLeft: 3 }}>PRO</Text>
          </View>
        </View>
        <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 20 }}>
          Try a 10-minute mobility flow before your workout today — it primes your joints and boosts range of motion.
        </Text>
        <Pressable onPress={() => router.push('/(user)/ai-trainer')} style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.accent }}>Ask AI Trainer</Text>
          <ChevronRight size={14} color={colors.accent} />
        </Pressable>
      </Card>

      {/* Footer logo */}
      <View style={{ alignItems: 'center', paddingTop: spacing.md }}>
        <Logo size={16} />
        <Text style={{ fontFamily: typography.body, fontSize: 10, color: colors.mutedForeground, marginTop: 2 }}>
          India's #1 AI Fitness App
        </Text>
      </View>
    </Screen>
  );
}
