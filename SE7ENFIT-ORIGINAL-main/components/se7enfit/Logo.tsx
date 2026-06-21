// SE7EN-FIT logo wordmark — matches web: "SE7ENFIT" with green "7".
import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';


export default function Logo({ size = 24, style, ...props }: { size?: number } & TextProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      style={[
        { fontFamily: typography.display, fontWeight: '700', fontSize: size, color: colors.foreground, letterSpacing: -0.5 },
        style,
      ]}
      {...props}
    >
      SE
      <Text style={{ color: colors.accent }}>7</Text>
      ENFIT
    </Text>
  );
}
