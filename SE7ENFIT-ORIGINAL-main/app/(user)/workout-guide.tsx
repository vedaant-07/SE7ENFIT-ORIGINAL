// Workout guide — short-form exercise video guide, form tips, and rest timer.
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { ChevronRight, Play, RotateCcw, SkipForward, Target, AlertTriangle, CheckCircle2, Video } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { EXERCISE_VIDEO_GUIDES } from '@/src/data/exerciseVideoGuides';

const SAMPLE_STEPS = EXERCISE_VIDEO_GUIDES.map((guide) => ({
  name: guide.name,
  sets: guide.sets,
  reps: guide.reps,
  rest_sec: guide.restSec,
  guide,
}));

type Phase = 'exercise' | 'rest';

export default function WorkoutGuide() {
  const { colors, radius, spacing, typography } = useTheme();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [setNum, setSetNum] = useState(1);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = SAMPLE_STEPS[index];
  const guide = step.guide;

  useEffect(() => {
    if (!running || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          advance();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining]);

  const startRest = () => {
    setPhase('rest');
    setRemaining(step.rest_sec);
    setRunning(true);
  };

  const advance = () => {
    if (phase === 'exercise') {
      if (setNum < step.sets) {
        setSetNum((s) => s + 1);
        startRest();
      } else {
        nextExercise();
      }
    } else {
      setPhase('exercise');
    }
  };

  const nextExercise = () => {
    if (index < SAMPLE_STEPS.length - 1) {
      setIndex((i) => i + 1);
      setSetNum(1);
      setPhase('exercise');
      setRunning(false);
      setRemaining(0);
    }
  };

  const reset = () => {
    setRunning(false);
    setPhase('exercise');
    setSetNum(1);
    setRemaining(0);
  };

  const openVideo = async () => {
    if (!guide.videoUrl) return;
    const canOpen = await Linking.canOpenURL(guide.videoUrl).catch(() => false);
    if (canOpen) await Linking.openURL(guide.videoUrl).catch(() => undefined);
  };

  return (
    <Screen scroll>
      <TopBar title="Workout Guide" />

      <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginBottom: spacing.sm }}>
        Exercise {index + 1} of {SAMPLE_STEPS.length}
      </Text>
      <Text style={{ fontFamily: typography.headingBold, fontSize: 26, color: colors.foreground, marginBottom: spacing.md }}>{step.name}</Text>

      <Card elevated style={{ padding: 0, overflow: 'hidden', marginBottom: spacing.lg }}>
        <View style={{ height: 420, backgroundColor: colors.secondary, justifyContent: 'space-between', padding: spacing.lg }}>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder }}>
            <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold, fontSize: 11, textTransform: 'uppercase' }}>Short video guide</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
              <Play size={38} color={colors.accentForeground} fill={colors.accentForeground} />
            </View>
            <Text style={{ fontFamily: typography.headingBold, fontSize: 22, color: colors.foreground, textAlign: 'center' }}>{guide.name}</Text>
            <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 6 }}>
              {guide.videoUrl ? 'Tap play to open CDN video preview' : 'CDN video slot ready — upload video URL from admin later'}
            </Text>
          </View>

          <Button label={guide.videoUrl ? 'Play Video' : 'Video Coming Soon'} onPress={openVideo} disabled={!guide.videoUrl} />
        </View>
      </Card>

      <Card elevated style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: phase === 'rest' ? colors.warning : colors.accent, textTransform: 'uppercase', marginBottom: spacing.sm }}>
          {phase === 'rest' ? 'Rest' : `Set ${setNum} of ${step.sets}`}
        </Text>
        <Text style={{ fontFamily: typography.display, fontSize: 56, color: colors.foreground }}>
          {phase === 'rest' ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : `${step.reps} reps`}
        </Text>
        <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, marginTop: spacing.xs }}>
          {step.sets} sets · {step.reps} reps · {step.rest_sec}s rest
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Button
          label={phase === 'rest' ? (running ? 'Pause' : 'Resume') : 'Start Rest'}
          variant={phase === 'rest' ? 'outline' : 'accent'}
          onPress={() => {
            if (phase === 'exercise') startRest();
            else setRunning((r) => !r);
          }}
        />
        <Button label="Next" variant="ghost" onPress={() => (phase === 'exercise' ? startRest() : advance())} />
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
          <Target size={16} color={colors.accent} />
          <Text style={{ fontFamily: typography.bodySemibold, color: colors.foreground }}>Target muscles</Text>
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: typography.body }}>{guide.targetMuscles.join(' · ')}</Text>
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
          <CheckCircle2 size={16} color={colors.accent} />
          <Text style={{ fontFamily: typography.bodySemibold, color: colors.foreground }}>Form tips</Text>
        </View>
        {guide.tips.map((tip) => <Text key={tip} style={{ color: colors.mutedForeground, fontFamily: typography.body, marginBottom: 4 }}>• {tip}</Text>)}
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
          <AlertTriangle size={16} color={colors.warning} />
          <Text style={{ fontFamily: typography.bodySemibold, color: colors.foreground }}>Common mistakes</Text>
        </View>
        {guide.mistakes.map((mistake) => <Text key={mistake} style={{ color: colors.mutedForeground, fontFamily: typography.body, marginBottom: 4 }}>• {mistake}</Text>)}
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Pressable onPress={reset} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <RotateCcw size={16} color={colors.mutedForeground} />
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Reset</Text>
        </Pressable>
        {index < SAMPLE_STEPS.length - 1 ? (
          <Pressable onPress={nextExercise} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, color: colors.accent, fontFamily: typography.bodySemibold }}>Skip exercise</Text>
            <SkipForward size={16} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      {index < SAMPLE_STEPS.length - 1 ? (
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Up Next</Text>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <Video size={16} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{SAMPLE_STEPS[index + 1].name}</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                {SAMPLE_STEPS[index + 1].sets} × {SAMPLE_STEPS[index + 1].reps}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
