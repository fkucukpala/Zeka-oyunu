import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { useThemedStyles, type Colors } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'outline', disabled, style }: Props) {
  const styles = useThemedStyles(makeStyles);
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
      <Text style={[styles.label, primary && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: c.accent },
    outline: { borderWidth: 1.5, borderColor: c.accent, backgroundColor: 'transparent' },
    disabled: { opacity: 0.35 },
    label: { fontSize: 16, fontWeight: '600', color: c.accent },
    primaryLabel: { color: c.onSelected },
  });
