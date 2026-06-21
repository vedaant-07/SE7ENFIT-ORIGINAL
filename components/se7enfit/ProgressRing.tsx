// Circular progress ring — mirrors the web ProgressRing component.
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  label?: string;
  value?: string;
};

export default function ProgressRing({
  size = 72,
  strokeWidth = 6,
  progress,
  color = colors.accent,
  label,
  value,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: typography.headingBold, fontSize: 14, color: colors.foreground }}>
            {value ?? `${Math.round(clamped * 100)}%`}
          </Text>
        </View>
      </View>
      {label ? (
        <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.mutedForeground, marginTop: 6, textAlign: 'center' }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
