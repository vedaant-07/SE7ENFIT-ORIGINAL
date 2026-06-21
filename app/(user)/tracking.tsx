// Tracking — consolidated view of water/steps/sleep/weight/etc with quick log.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Activity, Droplets, Footprints, Moon, Scale, Plus, Heart } from 'lucide-react-native';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import ProgressRing from '@/components/se7enfit/ProgressRing';
import { colors, spacing, typography } from '@/constants/theme';
import { trackingService } from '@/services/userServices';
import { useAsync } from '@/hooks/useAsync';

type Metric = { type: string; label: string; icon: typeof Droplets; value: number; goal: number; unit: string; color: string };

const METRICS: Metric[] = [
  { type: 'water', label: 'Water', icon: Droplets, value: 1.2, goal: 3.0, unit: 'L', color: '#38BDF8' },
  { type: 'steps', label: 'Steps', icon: Footprints, value: 5430, goal: 10000, unit: '', color: '#A78BFA' },
  { type: 'sleep', label: 'Sleep', icon: Moon, value: 6.5, goal: 8, unit: 'h', color: '#F472B6' },
  { type: 'weight', label: 'Weight', icon: Scale, value: 72, goal: 70, unit: 'kg', color: colors.accent },
  { type: 'mood', label: 'Mood', icon: Heart, value: 7, goal: 10, unit: '/10', color: '#F5A623' },
];

export default function Tracking() {
  const { data } = useAsync(() => trackingService.list({ date: new Date().toISOString().slice(0, 10) }));
  const [addingType, setAddingType] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const log = async (type: string) => {
    if (!value) return;
    setSaving(true);
    try {
      await trackingService.add({ type, value: Number(value) || value, date: new Date().toISOString().slice(0, 10) });
      setValue(''); setAddingType(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Tracking" showLogo />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <View key={m.type} style={{ width: '50%', padding: 4 }}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${m.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={m.color} />
                  </View>
                  <Text style={{ fontFamily: typography.bodySemibold, fontSize: 13, color: colors.foreground, flex: 1 }}>{m.label}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <ProgressRing size={72} progress={m.value / m.goal} value={`${m.value}`} color={m.color} />
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 6 }}>
                    of {m.goal}{m.unit}
                  </Text>
                </View>
                <Button label="Log" variant="outline" size="sm" fullWidth={false} onPress={() => setAddingType(addingType === m.type ? null : m.type)} style={{ marginTop: spacing.sm, height: 34, paddingHorizontal: 12, alignSelf: 'stretch' }} />
                {addingType === m.type ? (
                  <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                    <Input placeholder={`Enter ${m.label.toLowerCase()}`} value={value} onChangeText={setValue} keyboardType="numeric" />
                    <Button label={saving ? 'Saving…' : 'Save'} size="sm" onPress={() => log(m.type)} loading={saving} />
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
