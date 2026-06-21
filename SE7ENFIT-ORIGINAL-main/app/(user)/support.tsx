// Support — contact form + FAQ.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ChevronDown, ChevronUp, LifeBuoy } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';
import Button from '@/components/se7enfit/Button';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';

import { supportService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

const FAQS = [
  { q: 'How do I generate an AI workout plan?', a: 'Go to Workout tab → tap "Generate Plan" and answer a few quick questions.' },
  { q: 'Can I cancel my subscription?', a: 'Yes — go to Subscription → "Cancel Subscription". You keep access until the end of your billing period.' },
  { q: 'How do I link my gym?', a: 'Use a gym referral code during signup, or link it later from Profile → My Gym.' },
  { q: 'Is my data private?', a: 'Yes. We never sell your data. See our Privacy Policy for full details.' },
];

export default function Support() {
  const { colors, spacing, typography } = useTheme();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const submit = async () => {
    setError('');
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setBusy(true);
    try {
      await supportService.create(subject.trim(), message.trim());
      setSent(true);
      setSubject(''); setMessage('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Support" showLogo />

      {sent ? (
        <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
            <LifeBuoy size={24} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 16, color: colors.foreground }}>Message sent</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 }}>
            We'll get back to you within 24 hours.
          </Text>
        </Card>
      ) : (
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 14, color: colors.foreground, marginBottom: spacing.sm }}>Contact Support</Text>
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}
          <View style={{ gap: spacing.sm }}>
            <Input placeholder="Subject" value={subject} onChangeText={setSubject} />
            <Input placeholder="How can we help?" value={message} onChangeText={setMessage} multiline style={{ minHeight: 100 }} />
            <Button label={busy ? 'Sending…' : 'Send'} onPress={submit} loading={busy} />
          </View>
        </Card>
      )}

      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Frequently Asked</Text>
      <View style={{ gap: spacing.sm }}>
        {FAQS.map((f, i) => (
          <Card key={i} padded={false}>
            <Pressable onPress={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{f.q}</Text>
              {openFaq === i ? <ChevronUp size={16} color={colors.mutedForeground} /> : <ChevronDown size={16} color={colors.mutedForeground} />}
            </Pressable>
            {openFaq === i ? (
              <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>{f.a}</Text>
              </View>
            ) : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
