import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
  accent?: boolean;
};

export default function Card({ children, style, padded = true, elevated = false, accent = false }: Props) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: elevated ? colors.cardElevated : colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: accent ? colors.accentBorder : colors.border,
        shadowColor: accent ? colors.accent : '#000000',
        shadowOpacity: accent ? 0.22 : 0.14,
        shadowRadius: accent ? 18 : 10,
        shadowOffset: { width: 0, height: 8 },
        elevation: elevated || accent ? 3 : 1,
        ...(padded ? { padding: spacing.lg } : {}),
        ...style,
      }}
    >
      {children}
    </View>
  );
}
