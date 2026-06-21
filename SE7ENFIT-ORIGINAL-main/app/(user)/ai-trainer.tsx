// AI Trainer — chat interface for workout / nutrition / form questions.
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import TopBar from '@/components/se7enfit/TopBar';
import Input from '@/components/se7enfit/Input';

import { workoutService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';
import { useTheme } from '@/contexts/ThemeContext';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

let msgId = 0;
const nextId = () => `m${msgId++}`;

const GREETING: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Hey! I'm your AI fitness coach. Ask me for workout plans, form cues, meal ideas, or anything fitness.",
};

const SUGGESTIONS = [
  'Generate a 30-min HIIT plan',
  'Best foods for muscle gain',
  'How to fix rounded shoulders',
  'Beginner home workout',
];

export default function AITrainer() {
  const { colors, radius, spacing, typography } = useTheme();

  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', content }]);
    setSending(true);
    try {
      // Reuses the workout generator endpoint, since both accept a prompt.
      const result = await workoutService.generate({ prompt: content, goal: 'general_fitness' });
      const reply = typeof result === 'object' && result && 'title' in result
        ? `${result.title}\n\n${('exercises' in result && Array.isArray(result.exercises) ? (result.exercises as { name?: string }[]).map((e) => `• ${e.name || 'Exercise'}`).join('\n') : '')}`
        : "Here's a quick take: focus on compound movements (squats, deadlifts, presses) 3-4× a week, eat enough protein (1.6-2.2g per kg), and prioritize sleep. Ask me for specifics!";
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: reply }]);
    } catch (e) {
      const err = e instanceof ApiError ? e.message : 'I had trouble responding just now. Try again?';
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: err }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen scroll={false}>
      <TopBar title="AI Trainer" showLogo />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md }} showsVerticalScrollIndicator={false}>
          {messages.map((m) => (
            <View key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              {m.role === 'assistant' ? (
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={12} color={colors.accent} />
                  </View>
                  <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
                    <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>{m.content}</Text>
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
                  <Text style={{ fontFamily: typography.body, fontSize: 14, color: colors.accentForeground, lineHeight: 20 }}>{m.content}</Text>
                </View>
              )}
            </View>
          ))}
          {sending ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === 0 ? colors.accent : colors.mutedForeground }} />
              ))}
            </View>
          ) : null}

          {messages.length <= 1 ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.mutedForeground }}>Try asking</Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={({ pressed }) => ({ padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}>
                  <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.foreground }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Ask your AI coach…" value={input} onChangeText={setInput} multiline style={{ minHeight: 52, maxHeight: 120 }} />
          </View>
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
            style={({ pressed }) => ({
              width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || sending ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <Send size={20} color={colors.accentForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
