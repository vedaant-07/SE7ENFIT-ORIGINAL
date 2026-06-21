// Workout guide — step-by-step exercise list with timer for rest.
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Pause, Play, RotateCcw, SkipForward } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import { useTheme } from '@/contexts/ThemeContext';


type Step = { name: string; sets: number; reps: number; rest_sec: number };

const SAMPLE_STEPS: Step[] = [
  { name: 'Bench Press', sets: 4, reps: 10, rest_sec: 90 },
  { name: 'Incline Dumbbell Press', sets: 3, reps: 12, rest_sec: 75 },
  { name: 'Cable Fly', sets: 3, reps: 15, rest_sec: 60 },
  { name: 'Tricep Pushdown', sets: 3, reps: 12, rest_sec: 60 },
];

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

  useEffect(() => {
    if (!running || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
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
    }
  };

  const reset = () => {
    setRunning(false);
    setPhase('exercise');
    setSetNum(1);
    setRemaining(0);
  };

  return (
    <Screen scroll={false}>
      <TopBar title="Workout Guide" />

      <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginBottom: spacing.sm }}>
        Exercise {index + 1} of {SAMPLE_STEPS.length}
      </Text>
      <Text style={{ fontFamily: typography.headingBold, fontSize: 26, color: colors.foreground, marginBottom: spacing.md }}>{step.name}</Text>

      {/* Big timer / status card */}
      <Card elevated style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: phase === 'rest' ? colors.warning : colors.accent, textTransform: 'uppercase', marginBottom: spacing.sm }}>
          {phase === 'rest' ? 'Rest' : `Set ${setNum} of ${step.sets}`}
        </Text>
        <Text style={{ fontFamily: typography.display, fontSize: 56, color: colors.foreground }}>
          {phase === 'rest' ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : `${step.reps} reps`}
        </Text>
        {phase === 'exercise' ? (
          <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground, marginTop: spacing.xs }}>
            {step.sets} sets · {step.reps} reps each
          </Text>
        ) : null}
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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Up next */}
      {index < SAMPLE_STEPS.length - 1 ? (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: spacing.sm }}>Up Next</Text>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground }}>{SAMPLE_STEPS[index + 1].name}</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground }}>
                {SAMPLE_STEPS[index + 1].sets} × {SAMPLE_STEPS[index + 1].reps}
              </Text>
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
