import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'outline', disabled, style }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[styles.label, primary && { color: colors.onSelected }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  outline: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: 'transparent' },
  disabled: { opacity: 0.35 },
  label: { fontSize: 16, fontWeight: '600', color: colors.accent },
});
