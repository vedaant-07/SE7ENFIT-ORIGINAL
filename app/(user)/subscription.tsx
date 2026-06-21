// Subscription — SE7EN FIT plans.
// Plans: Free Trial (7 days), Basic (299/mo), Premium (499/mo), Quarterly (2999), Annual (5999).
// Payment gateway pending — no fake success.

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, Crown, AlertCircle } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { subscriptionService, type Subscription } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';

// SE7EN FIT subscription plans (exact match to product requirements)
const PLANS = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    currency: 'INR',
    period: '7 days',
    description: '7 days limited access',
    features: ['Limited workout access', 'Basic nutrition tracking', 'Try AI trainer'],
  },
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    price: 299,
    currency: 'INR',
    period: '/mo',
    description: 'Limited access',
    features: ['Full workout library', 'Nutrition tracking', 'Progress analytics', 'Community access'],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 499,
    currency: 'INR',
    period: '/mo',
    description: 'Unlock all features',
    features: ['Everything in Basic', 'AI personal trainer', 'Custom meal plans', 'Priority support'],
    popular: true,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 2999,
    currency: 'INR',
    period: '/3mo',
    description: 'Unlock all features',
    features: ['Everything in Premium', '3 months access', 'Save ₹500+', 'Exclusive challenges'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 5999,
    currency: 'INR',
    period: '/yr',
    description: 'Unlock all features',
    features: ['Everything in Premium', '12 months access', 'Save ₹2,400+', 'VIP support'],
  },
];

export default function Subscription() {
  const { data: subs } = useAsync(() => subscriptionService.getByUser());
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const activeSub: Subscription | undefined = subs?.[0];
  const activePlanId = activeSub?.plan?.toLowerCase().replace(/ /g, '_');

  const subscribe = async (planId: string) => {
    setError('');
    setUpgrading(planId);
    try {
      // Payment gateway pending - this will either redirect to payment or show coming soon
      await subscriptionService.create(planId);
      // TODO: Handle payment gateway redirect
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Could not start subscription';
      // Check if it's a "payment gateway pending" type response
      if (message.includes('payment') || message.includes('gateway')) {
        setError('Payment gateway coming soon. Subscription will be available shortly.');
      } else {
        setError(message);
      }
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <Screen>
      <TopBar title="Subscription" showLogo />

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {activeSub ? (
        <Card elevated style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Crown size={16} color={colors.warning} />
            <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.warning }}>Active Plan</Text>
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 22, color: colors.foreground, textTransform: 'capitalize' }}>
            {activeSub.plan}
          </Text>
          {activeSub.expires_at ? (
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>
              {activeSub.status === 'trialing' ? 'Trial ends' : 'Renews on'} {new Date(activeSub.expires_at).toLocaleDateString('en-IN')}
            </Text>
          ) : null}
          <Button
            label="Cancel Subscription"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => subscriptionService.cancel()}
            style={{ marginTop: spacing.md, alignSelf: 'stretch', height: 38 }}
          />
        </Card>
      ) : null}

      {/* Payment gateway notice */}
      <Card style={{ marginBottom: spacing.lg, borderColor: colors.warning, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AlertCircle size={18} color={colors.warning} />
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.warning }}>
            Payment Gateway Pending
          </Text>
        </View>
        <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: spacing.sm }}>
          Subscription purchases will be available soon. You can explore plans and pricing below.
        </Text>
      </Card>

      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>
        Choose a Plan
      </Text>

      <View style={{ gap: spacing.md }}>
        {PLANS.map((p) => {
          const isActive = p.id === activePlanId;
          return (
            <Card
              key={p.id}
              style={{
                borderColor: p.popular ? colors.accent : colors.border,
                borderWidth: p.popular ? 2 : 1,
                opacity: isActive ? 0.7 : 1,
              }}
            >
              {p.popular ? (
                <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.accentSoft, marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 10, color: colors.accent, fontFamily: typography.bodySemibold }}>MOST POPULAR</Text>
                </View>
              ) : null}
              <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground }}>{p.name}</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{p.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: spacing.sm }}>
                <Text style={{ fontFamily: typography.display, fontSize: 28, color: colors.accent }}>
                  {p.price === 0 ? 'Free' : `₹${p.price}`}
                </Text>
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground }}>{p.period}</Text>
              </View>
              <View style={{ gap: 6, marginBottom: spacing.md }}>
                {p.features.map((f) => (
                  <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Check size={14} color={colors.accent} />
                    <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.foreground }}>{f}</Text>
                  </View>
                ))}
              </View>
              <Button
                label={isActive ? 'Current Plan' : 'Subscribe'}
                variant={isActive ? 'outline' : 'accent'}
                loading={upgrading === p.id}
                disabled={isActive}
                onPress={() => subscribe(p.id)}
              />
            </Card>
          );
        })}
      </View>

      <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: spacing.lg, textAlign: 'center' }}>
        For Play Store and App Store subscriptions, in-app purchases will be integrated. Mobile subscription integration coming soon.
      </Text>
    </Screen>
  );
}
