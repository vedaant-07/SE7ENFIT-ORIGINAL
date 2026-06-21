// Base screen wrapper — black background, safe-area padding, optional header.
import { type ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  // When the screen sits above the bottom tab bar.
  withBottomNavPadding?: boolean;
  // Extra left padding to align header back button etc.
  paddingHorizontal?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

export default function Screen({
  children,
  scroll = true,
  withBottomNavPadding = false,
  paddingHorizontal,
  style,
  contentContainerStyle,
}: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const defaultPadding = spacing.lg;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        ...style,
      }}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: paddingHorizontal ?? defaultPadding,
            paddingTop: spacing.lg,
            paddingBottom: (withBottomNavPadding ? 96 : spacing.xxl) + insets.bottom,
            ...contentContainerStyle,
          }}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: paddingHorizontal ?? defaultPadding, paddingBottom: withBottomNavPadding ? 96 + insets.bottom : 0 }}>
          {children}
        </View>
      )}
    </View>
  );
}
