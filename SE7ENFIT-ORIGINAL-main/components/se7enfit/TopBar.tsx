// Compact top bar used across the app — back chevron + title + optional logo.
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from './Logo';

export default function TopBar({
  title,
  showLogo = false,
  showBack = true,
  onBack,
  right,
}: {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { colors, spacing, typography } = useTheme();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
      }}
    >
      {showBack && (
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
      )}
      {showLogo ? (
        <Logo size={20} />
      ) : (
        <Text style={{ fontFamily: typography.headingBold, fontSize: 20, color: colors.foreground, flex: 1 }}>
          {title}
        </Text>
      )}
      {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
    </View>
  );
}
