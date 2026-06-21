// SE7EN-FIT logo wordmark — matches web: "SE7ENFIT" with green "7".
import { Text, type TextProps } from 'react-native';
import { typography } from '@/constants/theme';

export default function Logo({ size = 24, style, ...props }: { size?: number } & TextProps) {
  return (
    <Text
      style={[
        { fontFamily: typography.display, fontWeight: '700', fontSize: size, color: '#FAFAFA', letterSpacing: -0.5 },
        style,
      ]}
      {...props}
    >
      SE
      <Text style={{ color: '#29E06B' }}>7</Text>
      ENFIT
    </Text>
  );
}
