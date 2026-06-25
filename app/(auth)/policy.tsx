// Policy pages — Terms & Privacy. Single screen, tab toggles content like web.
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/se7enfit/Screen';
import Logo from '@/components/se7enfit/Logo';
import { useTheme } from '@/contexts/ThemeContext';


type Tab = 'terms' | 'privacy';

const TERMS = [
  { h: 'Acceptance of Terms', p: 'By creating an account or using SE7EN-FIT, you agree to be bound by these Terms.' },
  { h: 'Use of Service', p: 'You must be at least 16 years old. You are responsible for keeping your account credentials secure.' },
  { h: 'Health Disclaimer', p: 'SE7EN-FIT provides fitness and nutrition information for general guidance only and is not a substitute for professional medical advice.' },
  { h: 'Subscriptions', p: 'Paid plans renew automatically until cancelled. You can cancel anytime from your subscription settings.' },
  { h: 'Termination', p: 'We may suspend or terminate access if you violate these Terms.' },
];

const PRIVACY = [
  { h: 'Information We Collect', p: 'Account details, fitness tracking data, and usage information necessary to provide the service.' },
  { h: 'How We Use It', p: 'To personalize workouts and nutrition plans, communicate with you, and improve the app.' },
  { h: 'Sharing', p: 'We do not sell your data. Aggregated, anonymous data may be used for analytics.' },
  { h: 'Data Security', p: 'We use industry-standard safeguards. No method of transmission over the internet is 100% secure.' },
  { h: 'Your Rights', p: 'You can request export or deletion of your data by contacting support.' },
];

export default function Policy() {
  const { colors, radius, spacing, typography } = useTheme();

  const router = useRouter();
  const [tab, setTab] = useState<Tab>('terms');

  const sections = tab === 'terms' ? TERMS : PRIVACY;

  return (
    <Screen scroll={false} paddingHorizontal={0}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 24, paddingHorizontal: spacing.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Logo size={20} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, marginBottom: 16 }}>
        {(['terms', 'privacy'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: radius.sm,
              backgroundColor: tab === t ? colors.accent : colors.card,
              borderWidth: 1,
              borderColor: tab === t ? colors.accent : colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: tab === t ? colors.accentForeground : colors.foreground }}>
              {t === 'terms' ? 'Terms' : 'Privacy'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: typography.headingBold, fontSize: 22, color: colors.foreground, marginBottom: 16 }}>
          {tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        </Text>
        {sections.map((s, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 15, color: colors.foreground, marginBottom: 6 }}>{s.h}</Text>
            <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 22 }}>{s.p}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
