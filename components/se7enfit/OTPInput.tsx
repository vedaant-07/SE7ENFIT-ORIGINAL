// OTP input — 6 separate digit cells, matches the web InputOTP layout.
// Uses a hidden TextInput to capture typed input.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Props = {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
};

export default function OTPInput({ length = 6, value, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrap}>
      <View style={styles.row}>
        {digits.map((d, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              (focused && i === value.length) || (value.length === length && i === length - 1 && focused)
                ? styles.cellFocused
                : null,
            ]}
          >
            <TextInput
              pointerEvents="none"
              editable={false}
              value={d}
              style={styles.cellText}
            />
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        style={styles.hiddenInput}
        autoFocus={autoFocus}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  cell: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  cellText: {
    color: colors.foreground,
    fontFamily: typography.headingBold,
    fontSize: 22,
    includeFontPadding: false,
  },
  hiddenInput: { position: 'absolute', width: '100%', height: 52, opacity: 0 },
});
