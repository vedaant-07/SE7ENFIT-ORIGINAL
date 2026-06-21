// SE7EN-FIT card — dark elevated surface with 1px border and rounded corners.
import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  // Renders a 1px accent-tinted top border like the web "cardElevated" look.
  elevated?: boolean;
};

export default function Card({ children, style, padded = true, elevated = false }: Props) {
  return (
    <View
      style={{
        backgroundColor: elevated ? colors.cardElevated : colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...(padded ? { padding: spacing.lg } : {}),
        ...style,
      }}
    >
      {children}
    </View>
  );
}
