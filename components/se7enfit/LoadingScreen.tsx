// SE7EN-FIT loading screen — black bg with centered logo + green spinner.
// Mirrors the web app's `AuthenticatedApp` loading state.
import { ActivityIndicator, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from './Logo';

export default function LoadingScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Logo size={28} />
        <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, marginTop: spacing.xs }}>
          Loading…
        </Text>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.md }} />
      </View>
    </View>
  );
}
